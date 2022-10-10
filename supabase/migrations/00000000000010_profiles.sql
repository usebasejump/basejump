/**
  * Creating a profile table is a recommended convention for Supabase
  * Any data related to the user can be added here instead of directly
  * on your auth.user table. The email is added here only for information purposes
  * it's needed to let account members know who's an active member
  * You cannot edit the email directly in the profile, you must change
  * the email of the user using the provided Supabase methods
 */
create table public.profiles
(
    -- the user's ID from the auth.users table out of supabase
    id         uuid unique references auth.users not null,
    -- the user's name
    name       text,
    -- when the profile was created
    updated_at timestamp with time zone,
    -- when the profile was last updated
    created_at timestamp with time zone,
    primary key (id)
);

-- Create the relationship with auth.users so we can do a join query
-- using postgREST
ALTER TABLE public.account_user
    ADD CONSTRAINT account_user_profiles_fkey FOREIGN KEY (user_id)
        REFERENCES profiles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION;

-- manage timestamps
CREATE TRIGGER set_profiles_timestamp
    BEFORE INSERT OR UPDATE
    ON public.profiles
    FOR EACH ROW
EXECUTE FUNCTION basejump.trigger_set_timestamps();


alter table public.profiles
    enable row level security;

-- permissions for viewing profiles for user and team members (ideally as two separate policies)
-- add permissions for updating profiles for the user only
create policy "Users can view their own profiles" on profiles
    for select
    to authenticated
    using (
    id = auth.uid()
    );

create policy "Users can view their teammates profiles" on profiles
    for select
    to authenticated
    using (
        id IN (SELECT account_user.user_id
               FROM account_user
               WHERE (account_user.user_id <> auth.uid()))
    );


create policy "Profiles are editable by their own user only" on profiles
    for update
    to authenticated
    using (
    id = auth.uid()
    );

/**
  * We maintain a profile table with users information.
  * We also want to provide an option to automatically create the first account
  * for a new user.  This is a good way to get folks through the onboarding flow easier
  * potentially
 */
create function basejump.run_new_user_setup()
    returns trigger
    language plpgsql
    security definer
    set search_path = public
as
$$
declare
    first_account_name  text;
    first_account_id    uuid;
    generated_user_name text;
begin

    -- first we setup the user profile
    -- TODO: see if we can get the user's name from the auth.users table once we learn how oauth works
    -- TODO: If no name is provided, use the first part of the email address
    if new.email IS NOT NULL then
        generated_user_name := split_part(new.email, '@', 1);
    end if;

    insert into public.profiles (id, name) values (new.id, generated_user_name);

    -- only create the first account if private accounts is enabled
    if basejump.is_set('enable_personal_accounts') = true then
        -- create the new users's personal account
        insert into public.accounts (primary_owner_user_id, personal_account)
        values (NEW.id, true)
        returning id into first_account_id;

        -- add them to the account_user table so they can act on it
        insert into public.account_user (account_id, user_id, account_role)
        values (first_account_id, NEW.id, 'owner');
    end if;
    return NEW;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
    after insert
    on auth.users
    for each row
execute procedure basejump.run_new_user_setup();