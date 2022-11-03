BEGIN;

select plan(17);
-- make sure we're setup for enabling personal accounts
update basejump.config
set enable_team_accounts = true;

--- we insert a user into auth.users and return the id into user_id to use
INSERT INTO auth.users (email, id)
VALUES ('primary@test.com', '1009e39a-fa61-4aab-a762-e7b1f3b014f3');
INSERT INTO auth.users (email, id)
VALUES ('owner@test.com', '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59');
INSERT INTO auth.users (email, id)
VALUES ('member@test.com', '29669d3a-a502-491f-b4f0-0211910ed7eb');

--- start acting as an authenticated user
set local search_path = core, public, extensions;
set local role authenticated;
set local "request.jwt.claims" to '{ "sub": "1009e39a-fa61-4aab-a762-e7b1f3b014f3", "email": "primary@test.com" }';

insert into accounts (id, team_name, personal_account)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'test', false);

-- setup users for tests
set local role postgres;
insert into account_user (account_id, user_id, account_role)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59', 'owner');
insert into account_user (account_id, user_id, account_role)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', '29669d3a-a502-491f-b4f0-0211910ed7eb', 'member');

--------
-- Acting as member
--------
set local role authenticated;
set local "request.jwt.claims" to '{ "sub": "29669d3a-a502-491f-b4f0-0211910ed7eb", "email": "member@test.com" }';

-- can't update role directly in the account_user table
SELECT results_ne(
               $$ update account_user set account_role = 'owner' where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = '29669d3a-a502-491f-b4f0-0211910ed7eb' returning 1 $$,
               $$ values(1) $$,
               'Members should not be able to update their own role'
           );

-- members should not be able to update any user roles
SELECT throws_ok(
               $$ select update_account_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', '29669d3a-a502-491f-b4f0-0211910ed7eb',  'owner', false) $$,
               'You must be an owner of the account to update a users role'
           );

-- member should still be only a member
SELECT row_eq(
               $$ select account_role from account_user where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = '29669d3a-a502-491f-b4f0-0211910ed7eb' $$,
               ROW ('member'::account_role),
               'Member should still be a member'
           );

-------
-- Acting as Non Primary Owner
-------
set local role authenticated;
set local "request.jwt.claims" to '{ "sub": "5d94cce7-054f-4d01-a9ec-51e7b7ba8d59", "email": "owner@test.com" }';

-- can't update role directly in the account_user table
SELECT results_ne(
               $$ update account_user set account_role = 'owner' where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = '29669d3a-a502-491f-b4f0-0211910ed7eb' returning 1 $$,
               $$ values(1) $$,
               'Members should not be able to update their own role'
           );

-- non primary owner cannot change primary owner
SELECT throws_ok(
               $$ select update_account_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', '29669d3a-a502-491f-b4f0-0211910ed7eb',  'owner', true) $$,
               'You must be the primary owner of the account to change the primary owner'
           );

SELECT row_eq(
               $$ select account_role from account_user where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = '29669d3a-a502-491f-b4f0-0211910ed7eb' $$,
               ROW ('member'::account_role),
               'Member should still be a member since primary owner change failed'
           );


-- trying to update accoutn user role of primary owner should fail
SELECT throws_ok(
               $$ select update_account_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', '1009e39a-fa61-4aab-a762-e7b1f3b014f3',  'owner', false) $$,
               'You must be the primary owner of the account to change the primary owner'
           );

--- primary owner should still be the same
SELECT row_eq(
               $$ select account_role from account_user where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = '1009e39a-fa61-4aab-a762-e7b1f3b014f3' $$,
               ROW ('owner'::account_role),
               'Primary owner should still be the same'
           );

-- account should have the same primary_owner_user_id
SELECT row_eq(
               $$ select primary_owner_user_id from accounts where id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' $$,
               ROW ('1009e39a-fa61-4aab-a762-e7b1f3b014f3'::uuid),
               'Primary owner should still be the same'
           );

-- non primary owner should be able to update other users roles
SELECT lives_ok(
               $$ select update_account_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', '29669d3a-a502-491f-b4f0-0211910ed7eb',  'owner', false) $$,
               'Non primary owner should be able to update other users roles'
           );

-- member should now be an owner
SELECT row_eq(
               $$ select account_role from account_user where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = '29669d3a-a502-491f-b4f0-0211910ed7eb' $$,
               ROW ('owner'::account_role),
               'Member should now be an owner'
           );

-------
-- Acting as primary owner
-------
set local role authenticated;
set local "request.jwt.claims" to '{ "sub": "1009e39a-fa61-4aab-a762-e7b1f3b014f3", "email": "primary@test.com" }';

-- can't update role directly in the account_user table
SELECT results_ne(
               $$ update account_user set account_role = 'member' where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = '29669d3a-a502-491f-b4f0-0211910ed7eb' returning 1 $$,
               $$ values(1) $$,
               'Members should not be able to update their own role'
           );

-- primary owner should be able to change user back to a member
SELECT lives_ok(
               $$ select update_account_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', '29669d3a-a502-491f-b4f0-0211910ed7eb',  'member', false) $$,
               'Primary owner should be able to change user back to a member'
           );

-- member should now be a member
SELECT row_eq(
               $$ select account_role from account_user where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = '29669d3a-a502-491f-b4f0-0211910ed7eb' $$,
               ROW ('member'::account_role),
               'Member should now be a member'
           );

-- primary owner can change a user into a primary owner
SELECT lives_ok(
               $$ select update_account_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', '29669d3a-a502-491f-b4f0-0211910ed7eb',  'owner', true) $$,
               'Primary owner should be able to change user into a primary owner'
           );

-- member should now be a primary owner
SELECT row_eq(
               $$ select account_role from account_user where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = '29669d3a-a502-491f-b4f0-0211910ed7eb' $$,
               ROW ('owner'::account_role),
               'Member should now be a primary owner'
           );

-- account primary_owner_user_id should be updated
SELECT row_eq(
               $$ select primary_owner_user_id from accounts where id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' $$,
               ROW ('29669d3a-a502-491f-b4f0-0211910ed7eb'::uuid),
               'Primary owner should be updated'
           );

SELECT *
FROM finish();

ROLLBACK;