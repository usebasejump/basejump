BEGIN;
CREATE EXTENSION "basejump-supabase_test_helpers";

select plan(8);

-- make sure we're setup for enabling personal accounts
update basejump.config
set enable_team_accounts = true;

--- Create the users we need for testing
select tests.create_supabase_user('test1');
select tests.create_supabase_user('invited');

--- start acting as an authenticated user
select tests.authenticate_as('test1');

insert into accounts (id, team_name, personal_account)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'test', false);

-- create invitation
SELECT row_eq(
               $$ insert into invitations (account_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'member', 'test_member_single_use_token', 'one-time') returning 1 $$,
               ROW (1),
               'Owners should be able to add invitations for new members'
           );

-- auth as new user
select tests.authenticate_as('invited');

-- should NOT be able to lookup invitations directly
SELECT is(
               (select count(*)::int from invitations),
               0,
               'Cannot load invitations directly'
           );

-- should be able to lookup an invitation I know the token for
SELECT row_eq(
               $$ select lookup_invitation('test_member_single_use_token')::text $$,
               ROW (json_build_object(
                       'active', true,
                       'team_name', 'test')::text
                   ),
               'Should be able to lookup an invitation I know the token for'
           );

-- should not be able to lookup a fake token
SELECT row_eq(
               $$ select lookup_invitation('not-real-token')::text $$,
               ROW (json_build_object(
                       'active', false,
                       'team_name', null)::text
                   ),
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
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN (select basejump.get_accounts_for_current_user())),
               'Should now be a part of the team'
           );

-- should have the correct role on the team
SELECT row_eq(
               $$ select account_role from account_user where account_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f'::uuid and user_id = tests.get_supabase_uid('invited') $$,
               ROW ('member'::account_role),
               'Should have the correct account role after accepting an invitation'
           );

SELECT *
FROM finish();

ROLLBACK;