-- the main testing for invitations on accounts is in the team_accounts tests
-- this batch is to let us test the more complicated behaviors such as one_time, 24_hour, multiple use, etc...accounts
BEGIN;
create extension "basejump-supabase_test_helpers" version '0.0.6';

select plan(35);

-- make sure we're setup for enabling personal accounts
update basejump.config
set enable_team_accounts = true;

-- create the users we need for testing
select tests.create_supabase_user('owner');
select tests.create_supabase_user('stranger');
select tests.create_supabase_user('invited_member1');
select tests.create_supabase_user('invited_member2');
select tests.create_supabase_user('invited_member3');
select tests.create_supabase_user('expired');

--- start acting as an authenticated user
select tests.authenticate_as('owner');

-- create the taem account
insert into basejump.accounts (id, name, slug, personal_account)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'test', 'test', false);

-- insert some invitations
SELECT row_eq(
               $$ insert into basejump.invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'owner', 'test_member_single_use_token', 'one_time') returning 1 $$,
               ROW (1),
               'Owners should be able to add one_time invitations for new members'
           );

SELECT row_eq(
               $$ insert into basejump.invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'member', 'test_member_24_hour_token', '24_hour') returning 1 $$,
               ROW (1),
               'Owners should be able to add 24_hour invitations for new members'
           );

-- Creating an invitation with the create_invitation function should also work
SELECT row_eq(
               $$ select json_object_keys(create_invitation('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f'::uuid, 'member'::basejump.account_role, '24_hour'::basejump.invitation_type))$$,
               ROW ('token'::text),
               'Owners should be able to add 24_hour invitations for new members with create_invitation'
           );

-- listing invitations should work
SELECT row_eq(
               $$ select json_array_length(get_account_invitations('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f')) $$,
               ROW (3),
               'Should be able to list invitations for an account as an owner'
           );

------- 
-- Deleting invitations
-------

insert into basejump.invitations (account_id, account_role, token, invitation_type, id)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'member', 'test_member_multiple_use_token', 'one_time',
        '5c795311-62cc-4e44-b056-8d2ac632d0bf');

select tests.authenticate_as('invited_member1');
select throws_ok(
               $$ select delete_invitation('5c795311-62cc-4e44-b056-8d2ac632d0bf') $$,
               'Only account owners can delete invitations'
           );

--- owner can delete invitations
select tests.authenticate_as('owner');
SELECT row_eq(
               $$ select json_array_length(get_account_invitations('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f')) $$,
               ROW (4),
               'Should be able to list invitations for an account as an owner'
           );
select delete_invitation('5c795311-62cc-4e44-b056-8d2ac632d0bf');
SELECT row_eq(
               $$ select json_array_length(get_account_invitations('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f')) $$,
               ROW (3),
               'Should be able to list invitations for an account as an owner'
           );
----------
-- Team member 1 joining with one_time token
----------
select tests.authenticate_as('invited_member1');

-- should be able to lookup an invitation I know the token for
SELECT results_eq(
               $$ select lookup_invitation('test_member_single_use_token')::text $$,
               $$ select json_build_object('active', true, 'account_name', 'test')::text $$,
               'Should be able to lookup an invitation I know the token for'
           );

-- should be able to lookup an invitation I know the token for
SELECT results_eq(
               $$ select lookup_invitation('not-a-real-token')::text $$,
               $$ select json_build_object('active', false, 'account_name', null)::text $$,
               'Fake tokens should fail lookup gracefully'
           );

-- should not be able to accept a fake invitation
SELECT throws_ok(
               $$ select accept_invitation('not-a-real-token') $$,
               'Invitation not found'
           );

-- should be able to accept an invitation
SELECT lives_ok(
               $$ select accept_invitation('test_member_single_use_token') $$,
               'Should be able to accept an invitation'
           );

-- should be able to get the team from get_accounts_with_role
SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN
                       (select basejump.get_accounts_with_role('owner'))),
               'Should now be a part of the team as owner'
           );

SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' NOT IN
                       (select basejump.get_accounts_with_role('member'))),
               'Should not be part of the team as member role'
           );

SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN
                       (select basejump.get_accounts_with_role())),
               'Should now be a part of the team as lookup all'
           );

SELECT row_eq(
               $$ select json_array_length(get_account_invitations('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f')) $$,
               ROW (2),
               'Should be able to list invitations for an account as an owner'
           );

------------
-- Second member joining with 24_hour token
------------
select tests.authenticate_as('invited_member2');

-- should not be able to lookup a consumed token
SELECT row_eq(
               $$ select lookup_invitation('test_member_single_use_token')::text $$,
               ROW (json_build_object('active', false, 'account_name', null)::text),
               'Should not be able to lookup a consumed token'
           );

-- should not be able to accept an invitation twice
SELECT throws_ok(
               $$ select accept_invitation('test_member_single_use_token') $$,
               'Invitation not found'
           );

-- should be able to lookup an invitation I know the token for
SELECT results_eq(
               $$ select lookup_invitation('test_member_24_hour_token')::text $$,
               $$ select json_build_object('active', true, 'account_name', 'test')::text $$,
               'Should be able to lookup an invitation I know the token for'
           );

-- should be able to accept an invitation
SELECT lives_ok(
               $$ select accept_invitation('test_member_24_hour_token') $$,
               'Should be able to accept a 24_hour invitation'
           );

-- should be able to get the team from get_accounts_with_role
SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' NOT IN
                       (select basejump.get_accounts_with_role('owner'))),
               'Should not be a part of the team as owner'
           );

SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN
                       (select basejump.get_accounts_with_role('member'))),
               'Should be part of the team as member role'
           );

SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN
                       (select basejump.get_accounts_with_role())),
               'Should now be a part of the team as lookup all'
           );

-- members should NOT be able to create new invitations
SELECT throws_ok(
               $$ insert into basejump.invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'member', 'test_permissions_token', 'one_time') returning 1 $$,
               'new row violates row-level security policy for table "invitations"'
           );

SELECT throws_ok(
               $$ select json_array_length(get_account_invitations('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f')) $$,
               'Only account owners can access this function'
           );
------------
-- Third member joining with 24_hour token
------------
select tests.authenticate_as('invited_member3');

-- should be able to lookup an invitation I know the token for
SELECT results_eq(
               $$ select lookup_invitation('test_member_24_hour_token')::text $$,
               $$ select json_build_object('active', true, 'account_name', 'test')::text $$,
               'Should be able to lookup an invitation I know the token for'
           );

-- should be able to accept an invitation
SELECT lives_ok(
               $$ select accept_invitation('test_member_24_hour_token') $$,
               'Should be able to accept a 24_hour invitation'
           );

-- should be able to get the team from get_accounts_with_role
SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' NOT IN
                       (select basejump.get_accounts_with_role('owner'))),
               'Should not be a part of the team as owner'
           );

SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN
                       (select basejump.get_accounts_with_role('member'))),
               'Should be part of the team as member role'
           );

SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN
                       (select basejump.get_accounts_with_role())),
               'Should now be a part of the team as lookup all'
           );

-----------
-- Strangers
----------
select tests.authenticate_as('stranger');

-- should not find any invitations
SELECT is_empty(
               $$ select * from basejump.invitations $$,
               'Should not have access to any invitations'
           );

-- inserting an invitation for an account ID you know but aren't an owner of should NOT work
SELECT throws_ok(
               $$ insert into basejump.invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'owner', 'test', 'one_time') returning 1 $$,
               'new row violates row-level security policy for table "invitations"'
           );


--------------
-- Anonymous
--------------
select tests.clear_authentication();

-- should not find any invitations
SELECT throws_ok(
               $$ select * from basejump.invitations $$,
               'permission denied for schema basejump'
           );

-- cannot create an invitation as an anonymous user for a known account ID
SELECT throws_ok(
               $$ insert into basejump.invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'owner', 'test', 'one_time') returning 1 $$,
               'permission denied for schema basejump'
           );


-----------
-- Expired 24_hour tokens
-----------

select tests.authenticate_as('owner');

select tests.freeze_time(CURRENT_TIMESTAMP - interval '25 hours');

insert into basejump.invitations (account_id, account_role, token, invitation_type)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f',
        'owner',
        'expired_token',
        '24_hour');

select tests.unfreeze_time();

select tests.authenticate_as('expired');

-- should not be able to lookup an expired token
SELECT row_eq(
               $$ select lookup_invitation('expired_token')::text $$,
               ROW (json_build_object('active', false, 'account_name', null)::text),
               'Should not be able to lookup an expired token'
           );

-- should not be able to accept an expired token
SELECT throws_ok(
               $$ select accept_invitation('expired_token') $$,
               'Invitation not found'
           );


SELECT *
FROM finish();

ROLLBACK;