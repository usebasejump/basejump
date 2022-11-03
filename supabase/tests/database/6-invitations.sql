-- the main testing for invitations on accounts is in the team_accounts tests
-- this batch is to let us test the more complicated behaviors such as one-time, 24-hour, multiple use, etc...accounts
BEGIN;

select plan(28);

-- make sure we're setup for enabling personal accounts
update basejump.config set enable_team_accounts = true;

--- we insert a user into auth.users and return the id into user_id to use
INSERT INTO auth.users (email, id) VALUES ('test@test.com', '1009e39a-fa61-4aab-a762-e7b1f3b014f3');
INSERT INTO auth.users (email, id) VALUES('stranger@test.com', '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59');
INSERT INTO auth.users (email, id) VALUES('invited_member1@test.com', '813748e9-8985-45c6-ad6d-01ab38db96fe');
INSERT INTO auth.users (email, id) VALUES('invited_member2@test.com', '45b3b769-5962-41b4-ac43-b92cc8929cea');
INSERT INTO auth.users (email, id) VALUES('invited_member3@test.com', 'f2c7a2a8-b0c0-46e7-9118-acbe71824931');
INSERT INTO auth.users (email, id) VALUES('expired@test.com', 'f4401edc-0afd-4c74-93cf-966901972f4f');

--- start acting as an authenticated user
set local search_path = core, public, extensions;
set local role authenticated;
set local "request.jwt.claims" to '{ "sub": "1009e39a-fa61-4aab-a762-e7b1f3b014f3", "email": "test@test.com" }';

-- create the taem account
insert into accounts (id, team_name, personal_account) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'test', false);

-- insert some invitations
SELECT
    row_eq(
    $$ insert into invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'owner', 'test_member_single_use_token', 'one-time') returning 1 $$,
    ROW(1),
    'Owners should be able to add one-time invitations for new members'
    );

SELECT
    row_eq(
    $$ insert into invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'member', 'test_member_24_hour_token', '24-hour') returning 1 $$,
    ROW(1),
    'Owners should be able to add 24-hour invitations for new members'
    );

----------
-- Team member 1 joining with one-time token
----------
set local role authenticated;
set local "request.jwt.claims" to '{ "sub": "813748e9-8985-45c6-ad6d-01ab38db96fe", "email": "invited_member1@test.com" }';

-- should be able to lookup an invitation I know the token for
SELECT
    results_eq(
    $$ select lookup_invitation('test_member_single_use_token')::text $$,
    $$ select json_build_object('active', true, 'team_name', 'test')::text $$,
    'Should be able to lookup an invitation I know the token for'
    );

-- should be able to lookup an invitation I know the token for
SELECT
    results_eq(
    $$ select lookup_invitation('not-a-real-token')::text $$,
    $$ select json_build_object('active', false, 'team_name', null)::text $$,
    'Fake tokens should fail lookup gracefully'
    );

-- should not be able to accept a fake invitation
SELECT
    throws_ok(
        $$ select accept_invitation('not-a-real-token') $$,
        'Invitation not found'
    );

-- should be able to accept an invitation
SELECT
    lives_ok(
    $$ select accept_invitation('test_member_single_use_token') $$,
    'Should be able to accept an invitation'
    );

-- should be able to get the team from get_accounts_for_current_user
SELECT
    ok(
        (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN (select basejump.get_accounts_for_current_user('owner'))),
        'Should now be a part of the team as owner'
    );

SELECT
    ok(
        (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' NOT IN (select basejump.get_accounts_for_current_user('member'))),
        'Should not be part of the team as member role'
    );

SELECT
    ok(
        (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN (select basejump.get_accounts_for_current_user())),
        'Should now be a part of the team as lookup all'
    );

------------
-- Second member joining with 24-hour token
------------
set local role authenticated;
set local "request.jwt.claims" to '{ "sub": "45b3b769-5962-41b4-ac43-b92cc8929cea", "email": "invited_member2@test.com" }';

-- should not be able to lookup a consumed token
SELECT
    row_eq(
    $$ select lookup_invitation('test_member_single_use_token')::text $$,
    ROW(json_build_object('active', false, 'team_name', null)::text),
    'Should not be able to lookup a consumed token'
    );

-- should not be able to accept an invitation twice
SELECT
    throws_ok(
    $$ select accept_invitation('test_member_single_use_token') $$,
    'Invitation not found'
    );

-- should be able to lookup an invitation I know the token for
SELECT
    results_eq(
    $$ select lookup_invitation('test_member_24_hour_token')::text $$,
    $$ select json_build_object('active', true, 'team_name', 'test')::text $$,
    'Should be able to lookup an invitation I know the token for'
    );

-- should be able to accept an invitation
SELECT
    lives_ok(
    $$ select accept_invitation('test_member_24_hour_token') $$,
    'Should be able to accept a 24-hour invitation'
    );

-- should be able to get the team from get_accounts_for_current_user
SELECT
    ok(
        (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' NOT IN (select basejump.get_accounts_for_current_user('owner'))),
        'Should not be a part of the team as owner'
    );

SELECT
    ok(
        (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN (select basejump.get_accounts_for_current_user('member'))),
        'Should be part of the team as member role'
    );

SELECT
    ok(
        (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN (select basejump.get_accounts_for_current_user())),
        'Should now be a part of the team as lookup all'
    );

-- members should NOT be able to create new invitations
SELECT
    throws_ok(
    $$ insert into invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'member', 'test_permissions_token', 'one-time') returning 1 $$,
    'new row violates row-level security policy for table "invitations"'
    );

------------
-- Third member joining with 24-hour token
------------
set local role authenticated;
set local "request.jwt.claims" to '{ "sub": "f2c7a2a8-b0c0-46e7-9118-acbe71824931", "email": "invited_member3@test.com" }';

-- should be able to lookup an invitation I know the token for
SELECT
    results_eq(
    $$ select lookup_invitation('test_member_24_hour_token')::text $$,
    $$ select json_build_object('active', true, 'team_name', 'test')::text $$,
    'Should be able to lookup an invitation I know the token for'
    );

-- should be able to accept an invitation
SELECT
    lives_ok(
    $$ select accept_invitation('test_member_24_hour_token') $$,
    'Should be able to accept a 24-hour invitation'
    );

-- should be able to get the team from get_accounts_for_current_user
SELECT
    ok(
        (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' NOT IN (select basejump.get_accounts_for_current_user('owner'))),
        'Should not be a part of the team as owner'
    );

SELECT
    ok(
        (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN (select basejump.get_accounts_for_current_user('member'))),
        'Should be part of the team as member role'
    );

SELECT
    ok(
        (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN (select basejump.get_accounts_for_current_user())),
        'Should now be a part of the team as lookup all'
    );

-----------
-- Strangers
----------
set role authenticated;
set local "request.jwt.claims" to '{ "sub": "5d94cce7-054f-4d01-a9ec-51e7b7ba8d59", "email": "stranger@test.com" }';

-- should not find any invitations
SELECT
    is_empty(
        $$ select * from invitations $$,
        'Should not have access to any invitations'
    );

-- inserting an invitation for an account ID you know but aren't an owner of should NOT work
SELECT
    throws_ok(
        $$ insert into invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'owner', 'test', 'one-time') returning 1 $$,
        'new row violates row-level security policy for table "invitations"'
    );


--------------
-- Anonymous
--------------
set local role anon;
set local "request.jwt.claims" to '';

-- should not find any invitations
SELECT
    is_empty(
        $$ select * from invitations $$,
        'Should not have access to any invitations'
    );

-- cannot create an invitation as an anonymous user for a known account ID
SELECT
    throws_ok(
        $$ insert into invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'owner', 'test', 'one-time') returning 1 $$,
        'new row violates row-level security policy for table "invitations"'
    );


-----------
-- Expired 24-hour tokens
-----------
set local role postgres;
-- we need to remove the invitations timestamp trigger so we can force the token to expire
drop trigger set_invitations_timestamp ON public.invitations;

set local role authenticated;
set local "request.jwt.claims" to '{ "sub": "1009e39a-fa61-4aab-a762-e7b1f3b014f3", "email": "test@test.com" }';

insert into invitations (account_id, account_role, token, invitation_type, created_at, updated_at) values
    (
        'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f',
        'owner',
        'expired_token',
        '24-hour',
        now() - interval '25 hours',
        now() - interval '25 hours'
     );

set local role authenticated;
set local "request.jwt.claims" to '{ "sub": "f4401edc-0afd-4c74-93cf-966901972f4f", "email": "expired@test.com" }';

-- should not be able to lookup an expired token
SELECT
    row_eq(
    $$ select lookup_invitation('expired_token')::text $$,
    ROW(json_build_object('active', false, 'team_name', null)::text),
    'Should not be able to lookup an expired token'
    );

-- should not be able to accept an expired token
SELECT
    throws_ok(
    $$ select accept_invitation('expired_token') $$,
    'Invitation not found'
    );


SELECT * FROM finish();

ROLLBACK;