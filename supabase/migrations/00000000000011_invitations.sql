/**
  * Invitation types are either email or link. Email invitations are sent to
  * a single user and can only be claimed once.  Link invitations can be used multiple times
  * Both expire after 24 hours
 */
DROP TYPE IF EXISTS public.invitation_type;

CREATE TYPE public.invitation_type AS ENUM ('one-time', '24-hour');
/**
  * Invitations are sent to users to join a account
  * They pre-define the role the user should have once they join
 */
create table public.invitations
(
    -- the id of the invitation
    id                 uuid unique                not null default uuid_generate_v4(),
    -- what role should invitation accepters be given in this account
    account_role       account_role               not null,
    -- the account the invitation is for
    account_id         uuid references accounts   not null,
    -- unique token used to accept the invitation
    token              text unique                not null default basejump.generate_token(30),
    -- who created the invitation
    invited_by_user_id uuid references auth.users not null,
    -- account name. filled in by a trigger
    account_team_name  text,
    -- when the invitation was last updated
    updated_at         timestamp with time zone,
    -- when the invitation was created
    created_at         timestamp with time zone,
    -- what type of invitation is this
    invitation_type    invitation_type            not null,
    primary key (id)
);

-- manage timestamps

CREATE TRIGGER set_invitations_timestamp
    BEFORE INSERT OR UPDATE
    ON public.invitations
    FOR EACH ROW
EXECUTE FUNCTION basejump.trigger_set_timestamps();

/**
  * This funciton fills in account info and inviting user email
  * so that the recipient can get more info about the invitation prior to
  * accepting.  It allows us to avoid complex permissions on accounts
 */
CREATE OR REPLACE FUNCTION basejump.trigger_set_invitation_details()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.invited_by_user_id = auth.uid();
    NEW.account_team_name = (select team_name from public.accounts where id = NEW.account_id);
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invitation_details
    BEFORE INSERT
    ON public.invitations
    FOR EACH ROW
EXECUTE FUNCTION basejump.trigger_set_invitation_details();

-- enable RLS on invitations
alter table public.invitations
    enable row level security;

create policy "Invitations viewable by account owners" on invitations
    for select
    to authenticated
    using (
            created_at > (now() - interval '24 hours')
        and
            (account_id IN
             (SELECT basejump.get_accounts_for_current_user('owner') AS get_accounts_for_current_user))
    );


create policy "Invitations can be created by account owners" on invitations
    for insert
    to authenticated
    with check (
        -- team accounts should be enabled
        basejump.is_set('enable_team_accounts') = true
        -- this should not be a personal account
        and (SELECT personal_account FROM public.accounts WHERE id = account_id) = false
        -- the inserting user should be an owner of the account
        and
            (account_id IN
             (SELECT basejump.get_accounts_for_current_user('owner') AS get_accounts_for_current_user))
    );

create policy "Invitations can be deleted by account owners" on invitations
    for delete
    to authenticated
    using (
    (account_id IN
     (SELECT basejump.get_accounts_for_current_user('owner') AS get_accounts_for_current_user))
    );

/**
  * Allows a user to accept an existing invitation and join a account
  * This one exists in the public schema because we want it to be called
  * using the supabase rpc method
 */
create or replace function accept_invitation(lookup_invitation_token text)
    returns uuid
    language plpgsql
    security definer set search_path = public
as
$$
declare
    lookup_account_id       uuid;
    declare new_member_role account_role;
begin
    select account_id, account_role
    into lookup_account_id, new_member_role
    from invitations
    where token = lookup_invitation_token
      and created_at > now() - interval '24 hours';

    if lookup_account_id IS NULL then
        raise exception 'Invitation not found';
    end if;

    if lookup_account_id is not null then
        -- we've validated the token is real, so grant the user access
        insert into account_user (account_id, user_id, account_role)
        values (lookup_account_id, auth.uid(), new_member_role);
        -- email types of invitations are only good for one usage
        delete from invitations where token = lookup_invitation_token and invitation_type = 'one-time';
    end if;
    return lookup_account_id;
end;
$$;

/**
  * Allows a user to lookup an existing invitation and join a account
  * This one exists in the public schema because we want it to be called
  * using the supabase rpc method
 */
create or replace function public.lookup_invitation(lookup_invitation_token text)
    returns json
    language plpgsql
    security definer set search_path = public
as
$$
declare
    team_name         text;
    invitation_active boolean;
begin
    select account_team_name,
           case when id IS NOT NULL then true else false end as active
    into team_name, invitation_active
    from invitations
    where token = lookup_invitation_token
      and created_at > now() - interval '24 hours'
    limit 1;
    return json_build_object('active', coalesce(invitation_active, false), 'team_name', team_name);
end;
$$;


grant execute on function accept_invitation(text) to authenticated;
grant execute on function lookup_invitation(text) to authenticated;
