BEGIN;
CREATE EXTENSION "basejump-supabase_test_helpers";

select plan(17);
-- make sure we're setup for enabling personal accounts
update basejump.config
set enable_team_accounts = true;

-- setup users needed for testing
select tests.create_supabase_user('primary');
select tests.create_supabase_user('owner');
select tests.create_supabase_user('member');

--- start acting as an authenticated user
select tests.authenticate_as('primary');

insert into accounts (id, team_name, personal_account)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'test', false);

-- setup users for tests
set local role postgres;
insert into account_user (account_id, user_id, account_role)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('owner'), 'owner');
insert into account_user (account_id, user_id, account_role)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('member'), 'member');

--------
-- Acting as member
--------
select tests.authenticate_as('member');

-- can't update role directly in the account_user table
SELECT results_ne(
               $$ update account_user set account_role = 'owner' where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('member') returning 1 $$,
               $$ values(1) $$,
               'Members should not be able to update their own role'
           );

-- members should not be able to update any user roles
SELECT throws_ok(
               $$ select update_account_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('member'),  'owner', false) $$,
               'You must be an owner of the account to update a users role'
           );

-- member should still be only a member
SELECT row_eq(
               $$ select account_role from account_user where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('member') $$,
               ROW ('member'::account_role),
               'Member should still be a member'
           );

-------
-- Acting as Non Primary Owner
-------
select tests.authenticate_as('owner');

-- can't update role directly in the account_user table
SELECT results_ne(
               $$ update account_user set account_role = 'owner' where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('member') returning 1 $$,
               $$ values(1) $$,
               'Members should not be able to update their own role'
           );

-- non primary owner cannot change primary owner
SELECT throws_ok(
               $$ select update_account_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('member'),  'owner', true) $$,
               'You must be the primary owner of the account to change the primary owner'
           );

SELECT row_eq(
               $$ select account_role from account_user where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('member') $$,
               ROW ('member'::account_role),
               'Member should still be a member since primary owner change failed'
           );


-- trying to update accoutn user role of primary owner should fail
SELECT throws_ok(
               $$ select update_account_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('primary'),  'owner', false) $$,
               'You must be the primary owner of the account to change the primary owner'
           );

--- primary owner should still be the same
SELECT row_eq(
               $$ select account_role from account_user where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('primary') $$,
               ROW ('owner'::account_role),
               'Primary owner should still be the same'
           );

-- account should have the same primary_owner_user_id
SELECT row_eq(
               $$ select primary_owner_user_id from accounts where id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' $$,
               ROW (tests.get_supabase_uid('primary')),
               'Primary owner should still be the same'
           );

-- non primary owner should be able to update other users roles
SELECT lives_ok(
               $$ select update_account_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('member'),  'owner', false) $$,
               'Non primary owner should be able to update other users roles'
           );

-- member should now be an owner
SELECT row_eq(
               $$ select account_role from account_user where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('member') $$,
               ROW ('owner'::account_role),
               'Member should now be an owner'
           );

-------
-- Acting as primary owner
-------
select tests.authenticate_as('primary');

-- can't update role directly in the account_user table
SELECT results_ne(
               $$ update account_user set account_role = 'member' where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('member') returning 1 $$,
               $$ values(1) $$,
               'Members should not be able to update their own role'
           );

-- primary owner should be able to change user back to a member
SELECT lives_ok(
               $$ select update_account_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('member'),  'member', false) $$,
               'Primary owner should be able to change user back to a member'
           );

-- member should now be a member
SELECT row_eq(
               $$ select account_role from account_user where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('member') $$,
               ROW ('member'::account_role),
               'Member should now be a member'
           );

-- primary owner can change a user into a primary owner
SELECT lives_ok(
               $$ select update_account_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('member'),  'owner', true) $$,
               'Primary owner should be able to change user into a primary owner'
           );

-- member should now be a primary owner
SELECT row_eq(
               $$ select account_role from account_user where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('member') $$,
               ROW ('owner'::account_role),
               'Member should now be a primary owner'
           );

-- account primary_owner_user_id should be updated
SELECT row_eq(
               $$ select primary_owner_user_id from accounts where id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' $$,
               ROW (tests.get_supabase_uid('member')),
               'Primary owner should be updated'
           );

SELECT *
FROM finish();

ROLLBACK;