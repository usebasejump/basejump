BEGIN;
create extension "basejump-supabase_test_helpers" version '0.0.6';

select plan(15);

--- we insert a user into auth.users and return the id into user_id to use

select tests.create_supabase_user('test1', 'test1@test.com');

select tests.create_supabase_user('test2');

------------
--- Primary Owner
------------
select tests.authenticate_as('test1');

-- should create the personal account automatically with the same ID as the user
SELECT row_eq(
               $$ select id, primary_owner_user_id, personal_account, name from basejump.accounts order by created_at desc limit 1 $$,
               ROW (tests.get_supabase_uid('test1'), tests.get_supabase_uid('test1'), true, 'test1'::text),
               'Inserting a user should create a personal account when personal accounts are enabled'
           );

-- should add that user to the account as an owner
SELECT row_eq(
               $$ select user_id, account_id, account_role from basejump.account_user $$,
               ROW (tests.get_supabase_uid('test1'), (select id from basejump.accounts where personal_account = true), 'owner'::basejump.account_role),
               'Inserting a user should also add an account_user for the created account'
           );

-- should be able to get your own role for the account
SELECT row_eq(
               $$ with data as (select id from basejump.accounts where personal_account = true) select public.current_user_account_role(data.id) from data $$,
               ROW (jsonb_build_object(
                       'account_role', 'owner',
                       'is_primary_owner', TRUE,
                       'is_personal_account', TRUE
                   )),
               'Primary owner should be able to get their own role'
           );

-- cannot change the accounts.primary_owner_user_id
SELECT throws_ok(
               $$ update basejump.accounts set primary_owner_user_id = '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59' where personal_account = true $$,
               'You do not have permission to update this field'
           );

-- cannot delete the primary_owner_user_id from the account_user table
select row_eq(
               $$
    	delete from basejump.account_user where user_id = tests.get_supabase_uid('test1');
    	select user_id from basejump.account_user where user_id = tests.get_supabase_uid('test1');
    $$,
               ROW (tests.get_supabase_uid('test1')),
               'Should not be able to delete the primary_owner_user_id from the account_user table'
           );

-- should not be able to add invitations to personal accounts
SELECT throws_ok(
               $$ insert into basejump.invitations (account_id, account_role, token, invitation_type) values ((select id from basejump.accounts where personal_account = true), 'owner', 'test', 'one_time') $$,
               'new row violates row-level security policy for table "invitations"'
           );

-- should not be able to add new users to personal accounts
SELECT throws_ok(
               $$ insert into basejump.account_user (account_id, account_role, user_id) values ((select id from basejump.accounts where personal_account = true), 'owner', '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59') $$,
               'new row violates row-level security policy for table "account_user"'
           );

-- cannot change personal_account setting no matter who you are
SELECT throws_ok(
               $$ update basejump.accounts set personal_account = false where personal_account = true $$,
               'You do not have permission to update this field'
           );

-- owner can update their team name
SELECT results_eq(
               $$ update basejump.accounts set name = 'test' where id = (select id from basejump.accounts where personal_account = true) returning name $$,
               $$ select 'test' $$,
               'Owner can update their team name'
           );

-- personal account should be returned by the basejump.get_accounts_with_role function
SELECT results_eq(
               $$ select basejump.get_accounts_with_role() $$,
               $$ select id from basejump.accounts where personal_account = true $$,
               'Personal account should be returned by the basejump.get_accounts_with_role function'
           );

-- should get true for personal account using has_role_on_account function
SELECT results_eq(
               $$ select basejump.has_role_on_account((select id from basejump.accounts where personal_account = true), 'owner') $$,
               $$ select true $$,
               'Should get true for personal account using has_role_on_account function'
           );

-----------
-- Strangers
----------
select tests.authenticate_as('test2');

-- non members / owner cannot update team name
SELECT results_ne(
               $$ update basejump.accounts set name = 'test' where primary_owner_user_id = tests.get_supabase_uid('test1') returning 1$$,
               $$ select 1 $$
           );

-- non member / owner should receive no results from accounts
SELECT is(
               (select count(*)::int
                from basejump.accounts
                where primary_owner_user_id <> tests.get_supabase_uid('test2')),
               0,
               'Non members / owner should receive no results from accounts'
           );


--------------
-- Anonymous
--------------
select tests.clear_authentication();

-- anonymous should receive no results from accounts
SELECT throws_ok(
               $$ select * from basejump.accounts $$,
               'permission denied for schema basejump'
           );

-- anonymous cannot update team name
SELECT throws_ok(
               $$ update basejump.accounts set name = 'test' returning 1 $$,
               'permission denied for schema basejump'
           );

SELECT *
FROM finish();

ROLLBACK;