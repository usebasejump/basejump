/**
 * Account roles allow you to provide permission levels to users
 * when they're acting on an account.  By default, we provide
 * "owner" and "member".  The only distinction is that owners can
 * also manage billing and invite/remove account members.
 */
DROP TYPE IF EXISTS public.account_role;

CREATE TYPE public.account_role AS ENUM ('owner', 'member');

/**
 * Accounts are the primary grouping for most objects within
 * the system. They have many users, and all billing is connected to
 * an account.
 */
 CREATE TABLE IF NOT EXISTS public.accounts
 (
     id uuid unique NOT NULL DEFAULT uuid_generate_v4(),
     -- defaults to the user who creates the account
     -- this user cannot be removed from an account without changing
     -- the primary owner first
     primary_owner_user_id uuid references auth.users not null default auth.uid(),
     -- Account name
     team_name text,
     personal_account boolean default false not null,
     updated_at timestamp with time zone,
     created_at timestamp with time zone,
     PRIMARY KEY (id)
 );

/**
 * We want to protect some fields on accounts from being updated
 * Specifically the primary owner user id and account id.
 * primary_owner_user_id should be updated using the dedicated function
 */
 CREATE OR REPLACE FUNCTION public.protect_account_fields()
     RETURNS TRIGGER AS
 $$
 BEGIN


    IF current_user IN ('authenticated', 'anon') THEN
       -- these are protected fields that users are not allowed to update themselves
       -- platform admins should be VERY careful about updating them as well.
       if NEW.id <> OLD.id
        OR NEW.personal_account <> OLD.personal_account
        OR NEW.primary_owner_user_id <> OLD.primary_owner_user_id
        THEN
           RAISE EXCEPTION 'You do not have permission to update this field';
        end if;
    end if;

    RETURN NEW;
 END
 $$ LANGUAGE plpgsql;

CREATE TRIGGER protect_account_fields
    BEFORE UPDATE
    ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_account_fields();

-- enable RLS for accounts
alter table accounts
    enable row level security;

-- protect the timestamps
CREATE TRIGGER set_accounts_timestamp
    BEFORE INSERT OR UPDATE ON public.accounts
    FOR EACH ROW
    EXECUTE PROCEDURE basejump.trigger_set_timestamps();

/**
  * Account users are the users that are associated with an account.
  * They can be invited to join the account, and can have different roles.
  * The system does not enforce any permissions for roles, other than restricting
  * billing and account membership to only owners
 */
create table account_user (
    -- id of the user in the account
    user_id uuid references auth.users not null,
    -- id of the account the user is in
    account_id uuid references accounts not null,
    -- role of the user in the account
    account_role account_role not null,
    constraint account_user_pkey primary key(user_id, account_id)
);

-- enable RLS for account_user
alter table account_user
    enable row level security;

/**
  * When an account gets created, we want to insert the current user as the first
  * owner
 */
create function basejump.add_current_user_to_new_account()
    returns trigger
    language plpgsql
security definer
set search_path=public
as $$
    begin
        if new.primary_owner_user_id = auth.uid() then
            insert into public.account_user (account_id, user_id, account_role)
            values (NEW.id, auth.uid(), 'owner');
        end if;
        return NEW;
    end;
$$;

-- trigger the function whenever a new account is created
CREATE TRIGGER add_current_user_to_new_account
    AFTER INSERT
    ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION basejump.add_current_user_to_new_account();

/**
  * Auth convenience functions
 */

 /**
   * Returns the current user's role within a given account_id
   * Exists in the public name space because it's accessible via the API
  */
create or replace function public.current_user_account_role(lookup_account_id uuid)
returns jsonb
language plpgsql
as $$
    declare
        user_account_role account_role;
        is_account_primary_owner boolean;
        is_personal_account boolean;
    begin
         if lookup_account_id is null then
           -- return an error
              raise exception 'account_id is required';
         end if;
        select account_role into user_account_role from public.account_user where user_id = auth.uid() and account_user.account_id = lookup_account_id;
        select primary_owner_user_id = auth.uid(), personal_account into is_account_primary_owner, is_personal_account from public.accounts where id = lookup_account_id;

        if user_account_role is null then
            return null;
        end if;

        return jsonb_build_object(
            'account_role', user_account_role,
            'is_primary_owner', is_account_primary_owner,
            'is_personal_account', is_personal_account
        );
    end;
$$;

grant execute on function public.current_user_account_role(uuid) to authenticated;

/**
  * Let's you update a users role within an account if you are an owner of that account
  **/
create or replace function public.update_account_user_role(account_id uuid, user_id uuid,  new_account_role account_role, make_primary_owner boolean)
returns void
security definer
set search_path=public
language plpgsql
as $$
    declare
        is_account_owner boolean;
        is_account_primary_owner boolean;
        changing_primary_owner boolean;
    begin
        -- check if the user is an owner, and if they are, allow them to update the role
        select (update_account_user_role.account_id IN ( SELECT basejump.get_accounts_for_current_user('owner') AS get_accounts_for_current_user)) into is_account_owner;

        if not is_account_owner then
            raise exception 'You must be an owner of the account to update a users role';
        end if;

        -- check if the user being changed is the primary owner, if so its not allowed
        select primary_owner_user_id = auth.uid(), primary_owner_user_id = update_account_user_role.user_id into is_account_primary_owner, changing_primary_owner from public.accounts where id = update_account_user_role.account_id;

        if changing_primary_owner = true and is_account_primary_owner = false then
        	raise exception 'You must be the primary owner of the account to change the primary owner';
        end if;

        update public.account_user set account_role = new_account_role where account_user.account_id = update_account_user_role.account_id and account_user.user_id = update_account_user_role.user_id;

        if make_primary_owner = true then
            -- first we see if the current user is the owner, only they can do this
            if is_account_primary_owner = false then
                raise exception 'You must be the primary owner of the account to change the primary owner';
            end if;

            update public.accounts set primary_owner_user_id = update_account_user_role.user_id where id = update_account_user_role.account_id;
        end if;
    end;
$$;

grant execute on function public.update_account_user_role(uuid, uuid, account_role, boolean) to authenticated;

/**
  * Returns account_ids that the current user is a member of. If you pass in a role,
  * it'll only return accounts that the user is a member of with that role.
  */
create or replace function basejump.get_accounts_for_current_user(passed_in_role account_role default null)
returns setof uuid
language sql
security definer
set search_path=public
as $$
    select account_id
    from public.account_user wu
    where wu.user_id = auth.uid()
      and
        (
            wu.account_role = passed_in_role
            or passed_in_role is null
        );
$$;

grant execute on function basejump.get_accounts_for_current_user(account_role) to authenticated;


/**
  * Account user permission policies
  * Account viewers can all view other account members and their roles
 */
create policy "users can view their own account_users" on account_user
  for select
                 to authenticated
                 using (
                 user_id = auth.uid()
                 );

create policy "users can view their teammates" on account_user
  for select
                 to authenticated
                 using (
                 (account_id IN ( SELECT basejump.get_accounts_for_current_user() AS get_accounts_for_authenticated_user))
                 );

/**
  * Account members can be removed by owners. You cannot remove the primary account owner
 */
create policy "Account users can be deleted except for the primary account owner" on account_user
  for delete
to authenticated
  using (
    (account_id IN ( SELECT basejump.get_accounts_for_current_user('owner') AS get_accounts_for_current_user))
    AND
    user_id != (select primary_owner_user_id from public.accounts where account_id = accounts.id)
  );

/**
  * Accounts are viewable by their owners and members
 */
create policy "Accounts are viewable by members" on accounts
  for select
  to authenticated
      using (
                 id in (
                 select basejump.get_accounts_for_current_user()
                 )
                 );

/**
  * Accounts need to be readable by primary_owner_user_id so that the select
  * after initial create is readable
 */
create policy "Accounts are viewable by primary owner" on accounts
  for select
                 to authenticated
                 using (
                 primary_owner_user_id = auth.uid()
                 );

/**
  * Accounts can be created by any user
 */
create policy "Team accounts can be created by any user" on accounts
  for insert
  to authenticated
  with check (
     basejump.is_set('enable_team_accounts') = true
    and personal_account = false
  );


create policy "Accounts can be edited by owners" on accounts
  for update
  to authenticated
  using (
    (id IN ( SELECT basejump.get_accounts_for_current_user('owner') AS get_accounts_for_current_user))
  );
