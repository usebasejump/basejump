-- the main testing for invitations on accounts is in the team_accounts tests
-- this batch is to let us test the more complicated behaviors such as one-time, 24-hour, multiple use, etc...accounts
BEGIN;
CREATE EXTENSION "basejump-supabase_test_helpers";

select plan(28);

-- make sure we're setup for enabling personal accounts
update basejump.config
set enable_team_accounts = true;

-- create the users we need for testing
select tests.create_supabase_user('test1');
select tests.create_supabase_user('stranger');
select tests.create_supabase_user('invited_member1');
select tests.create_supabase_user('invited_member2');
select tests.create_supabase_user('invited_member3');
select tests.create_supabase_user('expired');

--- start acting as an authenticated user
select tests.authenticate_as('test1');

-- create the taem account
insert into accounts (id, team_name, personal_account)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'test', false);

-- insert some invitations
SELECT row_eq(
               $$ insert into invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'owner', 'test_member_single_use_token', 'one-time') returning 1 $$,
               ROW (1),
               'Owners should be able to add one-time invitations for new members'
           );

SELECT row_eq(
               $$ insert into invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'member', 'test_member_24_hour_token', '24-hour') returning 1 $$,
               ROW (1),
               'Owners should be able to add 24-hour invitations for new members'
           );

----------
-- Team member 1 joining with one-time token
----------
select tests.authenticate_as('invited_member1');

-- should be able to lookup an invitation I know the token for
SELECT results_eq(
               $$ select lookup_invitation('test_member_single_use_token')::text $$,
               $$ select json_build_object('active', true, 'team_name', 'test')::text $$,
               'Should be able to lookup an invitation I know the token for'
           );

-- should be able to lookup an invitation I know the token for
SELECT results_eq(
               $$ select lookup_invitation('not-a-real-token')::text $$,
               $$ select json_build_object('active', false, 'team_name', null)::text $$,
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

-- should be able to get the team from get_accounts_for_current_user
SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN
                       (select basejump.get_accounts_for_current_user('owner'))),
               'Should now be a part of the team as owner'
           );

SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' NOT IN
                       (select basejump.get_accounts_for_current_user('member'))),
               'Should not be part of the team as member role'
           );

SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN (select basejump.get_accounts_for_current_user())),
               'Should now be a part of the team as lookup all'
           );

------------
-- Second member joining with 24-hour token
------------
select tests.authenticate_as('invited_member2');

-- should not be able to lookup a consumed token
SELECT row_eq(
               $$ select lookup_invitation('test_member_single_use_token')::text $$,
               ROW (json_build_object('active', false, 'team_name', null)::text),
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
               $$ select json_build_object('active', true, 'team_name', 'test')::text $$,
               'Should be able to lookup an invitation I know the token for'
           );

-- should be able to accept an invitation
SELECT lives_ok(
               $$ select accept_invitation('test_member_24_hour_token') $$,
               'Should be able to accept a 24-hour invitation'
           );

-- should be able to get the team from get_accounts_for_current_user
SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' NOT IN
                       (select basejump.get_accounts_for_current_user('owner'))),
               'Should not be a part of the team as owner'
           );

SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN
                       (select basejump.get_accounts_for_current_user('member'))),
               'Should be part of the team as member role'
           );

SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN (select basejump.get_accounts_for_current_user())),
               'Should now be a part of the team as lookup all'
           );

-- members should NOT be able to create new invitations
SELECT throws_ok(
               $$ insert into invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'member', 'test_permissions_token', 'one-time') returning 1 $$,
               'new row violates row-level security policy for table "invitations"'
           );

------------
-- Third member joining with 24-hour token
------------
select tests.authenticate_as('invited_member3');

-- should be able to lookup an invitation I know the token for
SELECT results_eq(
               $$ select lookup_invitation('test_member_24_hour_token')::text $$,
               $$ select json_build_object('active', true, 'team_name', 'test')::text $$,
               'Should be able to lookup an invitation I know the token for'
           );

-- should be able to accept an invitation
SELECT lives_ok(
               $$ select accept_invitation('test_member_24_hour_token') $$,
               'Should be able to accept a 24-hour invitation'
           );

-- should be able to get the team from get_accounts_for_current_user
SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' NOT IN
                       (select basejump.get_accounts_for_current_user('owner'))),
               'Should not be a part of the team as owner'
           );

SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN
                       (select basejump.get_accounts_for_current_user('member'))),
               'Should be part of the team as member role'
           );

SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN (select basejump.get_accounts_for_current_user())),
               'Should now be a part of the team as lookup all'
           );

-----------
-- Strangers
----------
select tests.authenticate_as('stranger');

-- should not find any invitations
SELECT is_empty(
               $$ select * from invitations $$,
               'Should not have access to any invitations'
           );

-- inserting an invitation for an account ID you know but aren't an owner of should NOT work
SELECT throws_ok(
               $$ insert into invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'owner', 'test', 'one-time') returning 1 $$,
               'new row violates row-level security policy for table "invitations"'
           );


--------------
-- Anonymous
--------------
select tests.clear_authentication();

-- should not find any invitations
SELECT is_empty(
               $$ select * from invitations $$,
               'Should not have access to any invitations'
           );

-- cannot create an invitation as an anonymous user for a known account ID
SELECT throws_ok(
               $$ insert into invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'owner', 'test', 'one-time') returning 1 $$,
               'new row violates row-level security policy for table "invitations"'
           );


-----------
-- Expired 24-hour tokens
-----------
set local role postgres;
-- we need to remove the invitations timestamp trigger so we can force the token to expire
drop trigger set_invitations_timestamp ON public.invitations;

select tests.authenticate_as('test1');

insert into invitations (account_id, account_role, token, invitation_type, created_at, updated_at)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f',
        'owner',
        'expired_token',
        '24-hour',
        now() - interval '25 hours',
        now() - interval '25 hours');

select tests.authenticate_as('expired');

-- should not be able to lookup an expired token
SELECT row_eq(
               $$ select lookup_invitation('expired_token')::text $$,
               ROW (json_build_object('active', false, 'team_name', null)::text),
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