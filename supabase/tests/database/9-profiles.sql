BEGIN;
CREATE EXTENSION "basejump-supabase_test_helpers";

select plan(6);
-- make sure we're setup for enabling personal accounts
update basejump.config
set enable_team_accounts = true;

-- setup the users we need for testing
select tests.create_supabase_user('test1', 'test@test.com');
select tests.create_supabase_user('test2', 'test2@test.com');


--- start acting as an authenticated user
select tests.authenticate_as('test1');

-- user should have access to their own profile
select is(
               (select name from profiles where id = tests.get_supabase_uid('test1')),
               'test',
               'User should have access to their own profile, profile should auto-set name to first half of email'
           );

-- user should not have access to other profiles
select is_empty(
               $$ select * from profiles where id <> tests.get_supabase_uid('test1') $$,
               'User should not have access to any other profiles'
           );

-- Users should be able to update their own names
select row_eq(
               $$ update profiles set name = 'test update' where id = tests.get_supabase_uid('test1') returning name $$,
               ROW ('test update'::text),
               'User should be able to update their own name'
           );

-- User should not be able to update other users names
select results_ne(
               $$ update profiles set name = 'test update' where id = tests.get_supabase_uid('test2') returning 1 $$,
               $$ values(1) $$,
               'Should not be able to update profile'
           );

-- Create a new account so you can start sharing profiles
insert into accounts (id, team_name, personal_account)
values ('eb3a0306-7331-4c42-a580-970e7ba6a11d', 'test team', false);

-- set role to postgres, and then insert an account_user for the second user
select tests.clear_authentication();
set local role postgres;
insert into account_user (account_id, user_id, account_role)
values ('eb3a0306-7331-4c42-a580-970e7ba6a11d', tests.get_supabase_uid('test2'), 'owner');

-- back to authenticated user
select tests.authenticate_as('test1');

-- User should now have access to the second profile
select row_eq(
               $$ select name from profiles where id = tests.get_supabase_uid('test2') $$,
               ROW ('test2'::text),
               'User should have access to teammates profiles'
           );

-- still can't update teammates profiles
select results_ne(
               $$ update profiles set name = 'test update' where id = tests.get_supabase_uid('test2') returning 1 $$,
               $$ values(1) $$,
               'Should not be able to update profile'
           );
SELECT *
FROM finish();

ROLLBACK;