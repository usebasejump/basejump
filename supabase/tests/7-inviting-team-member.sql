BEGIN;

select plan(8);

-- make sure we're setup for enabling personal accounts
update basejump.config set enable_team_accounts = true;

--- we insert a user into auth.users and return the id into user_id to use
INSERT INTO auth.users (email, id) VALUES ('test@test.com', '1009e39a-fa61-4aab-a762-e7b1f3b014f3');
INSERT INTO auth.users (email, id) VALUES('invited_test@test.com', '813748e9-8985-45c6-ad6d-01ab38db96fe');

--- start acting as an authenticated user
set local search_path = core, public, extensions;
set local role authenticated;

-- create the taem account
set local "request.jwt.claims" to '{ "sub": "1009e39a-fa61-4aab-a762-e7b1f3b014f3", "email": "test@test.com" }';
insert into accounts (id, team_name, personal_account) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'test', false);

-- create invitation
SELECT
    row_eq(
    $$ insert into invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'member', 'test_member_single_use_token', 'one-time') returning 1 $$,
    ROW(1),
    'Owners should be able to add invitations for new members'
    );

-- auth as new user
set local "request.jwt.claims" to '{ "sub": "813748e9-8985-45c6-ad6d-01ab38db96fe", "email": "invited_test@test.com" }';

-- should NOT be able to lookup invitations directly
SELECT
    is(
    (select count(*)::int from invitations),
    0,
    'Cannot load invitations directly'
    );

-- should be able to lookup an invitation I know the token for
SELECT
    row_eq(
    $$ select lookup_invitation('test_member_single_use_token')::text $$,
    ROW(json_build_object(
    	'active', true,
    	'team_name', 'test')::text
    	),
    'Should be able to lookup an invitation I know the token for'
    );

-- should not be able to lookup a fake token
SELECT
    row_eq(
    $$ select lookup_invitation('not-real-token')::text $$,
    ROW(json_build_object(
    	'active', false,
    	'team_name', null)::text
    	),
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
        (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN (select basejump.get_accounts_for_current_user())),
        'Should now be a part of the team'
    );

-- should have the correct role on the team
SELECT
    row_eq(
    $$ select account_role from account_user where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f'::uuid and user_id = '813748e9-8985-45c6-ad6d-01ab38db96fe'::uuid $$,
    ROW('member'::account_role),
    'Should have the correct account role after accepting an invitation'
    );

SELECT * FROM finish();

ROLLBACK;