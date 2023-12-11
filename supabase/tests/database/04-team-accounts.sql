BEGIN;
create extension "basejump-supabase_test_helpers" version '0.0.6';

select plan(34);

-- make sure we're setup for enabling personal accounts
update basejump.config
set enable_team_accounts = true;

-- Create the users we plan on using for testing
select tests.create_supabase_user('test1');
select tests.create_supabase_user('test2');
select tests.create_supabase_user('test_member');
select tests.create_supabase_user('test_owner');
select tests.create_supabase_user('test_random_owner');

--- start acting as an authenticated user
select tests.authenticate_as('test_random_owner');

-- setup inaccessible tests for a known account ID
insert into basejump.accounts (id, name, slug, personal_account)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'nobody in test can access me', 'no-access', false);

------------
--- Primary Owner
------------
select tests.authenticate_as('test1');

-- should be able to create a team account when they're enabled
SELECT row_eq(
               $$ insert into basejump.accounts (id, name, slug, personal_account) values ('8fcec130-27cd-4374-9e47-3303f9529479', 'test team', 'test-team', false) returning 1$$,
               ROW (1),
               'Should be able to create a new team account'
           );

-- newly created team should be owned by current user
SELECT row_eq(
               $$ select primary_owner_user_id from basejump.accounts where id = '8fcec130-27cd-4374-9e47-3303f9529479' $$,
               ROW (tests.get_supabase_uid('test1')),
               'Creating a new team account should make the current user the primary owner'
           );

-- should add that user to the account as an owner
SELECT row_eq(
               $$ select user_id, account_role from basejump.account_user where account_id = '8fcec130-27cd-4374-9e47-3303f9529479'::uuid $$,
               ROW (tests.get_supabase_uid('test1'), 'owner'::basejump.account_role),
               'Inserting an account should also add an account_user for the current user'
           );

-- should be able to get your own role for the account
SELECT row_eq(
               $$ select public.current_user_account_role('8fcec130-27cd-4374-9e47-3303f9529479') $$,
               ROW (jsonb_build_object(
                       'account_role', 'owner',
                       'is_primary_owner', TRUE,
                       'is_personal_account', FALSE
                   )),
               'Primary owner should be able to get their own role'
           );

-- cannot change the accounts.primary_owner_user_id directly
SELECT throws_ok(
               $$ update basejump.accounts set primary_owner_user_id = tests.get_supabase_uid('test2') where personal_account = false $$,
               'You do not have permission to update this field'
           );

-- cannot delete the primary_owner_user_id from the account_user table
select row_eq(
               $$
    	delete from basejump.account_user where user_id = tests.get_supabase_uid('test1');
    	select user_id from basejump.account_user where user_id = tests.get_supabase_uid('test1');
    $$,
               ROW (tests.get_supabase_uid('test1')::uuid),
               'Should not be able to delete the primary_owner_user_id from the account_user table'
           );

-- owners should be able to add invitations
SELECT row_eq(
               $$ insert into basejump.invitations (account_id, account_role, token, invitation_type) values ('8fcec130-27cd-4374-9e47-3303f9529479', 'member', 'test_member_single_use_token', 'one_time') returning 1 $$,
               ROW (1),
               'Owners should be able to add invitations for new members'
           );

SELECT row_eq(
               $$ insert into basejump.invitations (account_id, account_role, token, invitation_type) values ('8fcec130-27cd-4374-9e47-3303f9529479', 'owner', 'test_owner_single_use_token', 'one_time') returning 1 $$,
               ROW (1),
               'Owners should be able to add invitations for new owners'
           );

-- should not be able to add new users directly into team accounts
SELECT throws_ok(
               $$ insert into basejump.account_user (account_id, account_role, user_id) values ('8fcec130-27cd-4374-9e47-3303f9529479', 'owner', tests.get_supabase_uid('test2')) $$,
               'new row violates row-level security policy for table "account_user"'
           );

-- cannot change personal_account setting no matter who you are
SELECT throws_ok(
               $$ update basejump.accounts set personal_account = true where id = '8fcec130-27cd-4374-9e47-3303f9529479' $$,
               'You do not have permission to update this field'
           );

-- owner can update their team name
SELECT results_eq(
               $$ update basejump.accounts set name = 'test' where id = '8fcec130-27cd-4374-9e47-3303f9529479' returning name $$,
               $$ values('test') $$,
               'Owner can update their team name'
           );

-- all accounts (personal and team) should be returned by get_accounts_with_role test
SELECT ok(
               (select '8fcec130-27cd-4374-9e47-3303f9529479' IN
                       (select basejump.get_accounts_with_role())),
               'Team account should be returned by the basejump.get_accounts_with_role function'
           );

-- shouoldn't return any accounts if you're not a member of
SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' NOT IN
                       (select basejump.get_accounts_with_role())),
               'Team accounts not a member of should NOT be returned by the basejump.get_accounts_with_role function'
           );

-- should return true for basejump.has_role_on_account
SELECT ok(
               (select basejump.has_role_on_account('8fcec130-27cd-4374-9e47-3303f9529479', 'owner')),
               'Should return true for basejump.has_role_on_account'
           );

SELECT ok(
               (select basejump.has_role_on_account('8fcec130-27cd-4374-9e47-3303f9529479')),
               'Should return true for basejump.has_role_on_account'
           );

-- should return FALSE when not on the account
SELECT ok(
               (select NOT basejump.has_role_on_account('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f')),
               'Should return false for basejump.has_role_on_account'
           );

-----------
--- Account User Setup
-----------
select tests.clear_authentication();
set role postgres;

-- insert account_user for the member test
insert into basejump.account_user (account_id, account_role, user_id)
values ('8fcec130-27cd-4374-9e47-3303f9529479', 'member', tests.get_supabase_uid('test_member'));
-- insert account_user for the owner test
insert into basejump.account_user (account_id, account_role, user_id)
values ('8fcec130-27cd-4374-9e47-3303f9529479', 'owner', tests.get_supabase_uid('test_owner'));

-----------
--- Member
-----------
select tests.authenticate_as('test_member');

-- should now have access to the account
SELECT is(
               (select count(*)::int from basejump.accounts where id = '8fcec130-27cd-4374-9e47-3303f9529479'),
               1,
               'Should now have access to the account'
           );

-- members cannot update account info
SELECT results_ne(
               $$ update basejump.accounts set name = 'test' where id = '8fcec130-27cd-4374-9e47-3303f9529479' returning 1 $$,
               $$ values(1) $$,
               'Member cannot can update their team name'
           );

-- account_user should have a role of member
SELECT row_eq(
               $$ select account_role from basejump.account_user where account_id = '8fcec130-27cd-4374-9e47-3303f9529479' and user_id = tests.get_supabase_uid('test_member')$$,
               ROW ('member'::basejump.account_role),
               'Should have the correct account role after accepting an invitation'
           );

-- should be able to get your own role for the account
SELECT row_eq(
               $$ select public.current_user_account_role('8fcec130-27cd-4374-9e47-3303f9529479') $$,
               ROW (jsonb_build_object(
                       'account_role', 'member',
                       'is_primary_owner', FALSE,
                       'is_personal_account', FALSE
                   )),
               'Member should be able to get their own role'
           );

-- Should NOT show up as an owner in the permissions check
SELECT ok(
               (select '8fcec130-27cd-4374-9e47-3303f9529479' NOT IN
                       (select basejump.get_accounts_with_role('owner'))),
               'Newly added account ID should not be in the list of accounts returned by basejump.get_accounts_with_role("owner")'
           );

-- Should be able ot get a full list of accounts when no permission passed in
SELECT ok(
               (select '8fcec130-27cd-4374-9e47-3303f9529479' IN
                       (select basejump.get_accounts_with_role())),
               'Newly added account ID should be in the list of accounts returned by basejump.get_accounts_with_role()'
           );

-- should return true for basejump.has_role_on_account
SELECT ok(
               (select basejump.has_role_on_account('8fcec130-27cd-4374-9e47-3303f9529479')),
               'Should return true for basejump.has_role_on_account'
           );

-- should return false for the owner lookup
SELECT ok(
               (select NOT basejump.has_role_on_account('8fcec130-27cd-4374-9e47-3303f9529479', 'owner')),
               'Should return false for basejump.has_role_on_account'
           );

-----------
--- Non-Primary Owner
-----------
select tests.authenticate_as('test_owner');

-- should now have access to the account
SELECT is(
               (select count(*)::int from basejump.accounts where id = '8fcec130-27cd-4374-9e47-3303f9529479'),
               1,
               'Should now have access to the account'
           );

-- account_user should have a role of member
SELECT row_eq(
               $$ select account_role from basejump.account_user where account_id = '8fcec130-27cd-4374-9e47-3303f9529479' and user_id = tests.get_supabase_uid('test_owner')$$,
               ROW ('owner'::basejump.account_role),
               'Should have the expected account role'
           );

-- should be able to get your own role for the account
SELECT row_eq(
               $$ select public.current_user_account_role('8fcec130-27cd-4374-9e47-3303f9529479') $$,
               ROW (jsonb_build_object(
                       'account_role', 'owner',
                       'is_primary_owner', FALSE,
                       'is_personal_account', FALSE
                   )),
               'Owner should be able to get their own role'
           );

-- Should NOT show up as an owner in the permissions check
SELECT ok(
               (select '8fcec130-27cd-4374-9e47-3303f9529479' IN
                       (select basejump.get_accounts_with_role('owner'))),
               'Newly added account ID should not be in the list of accounts returned by basejump.get_accounts_with_role("owner")'
           );

-- Should be able ot get a full list of accounts when no permission passed in
SELECT ok(
               (select '8fcec130-27cd-4374-9e47-3303f9529479' IN
                       (select basejump.get_accounts_with_role())),
               'Newly added account ID should be in the list of accounts returned by basejump.get_accounts_with_role()'
           );

SELECT results_eq(
               $$ update basejump.accounts set name = 'test2' where id = '8fcec130-27cd-4374-9e47-3303f9529479' returning name $$,
               $$ values('test2') $$,
               'New owners can update their team name'
           );

-----------
-- Strangers
----------

select tests.authenticate_as('test2');

-- non members / owner cannot update team name
SELECT results_ne(
               $$ update basejump.accounts set name = 'test3' where id = '8fcec130-27cd-4374-9e47-3303f9529479' returning 1$$,
               $$ select 1 $$
           );
-- non member / owner should receive no results from accounts
SELECT is(
               (select count(*)::int from basejump.accounts where personal_account = false),
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