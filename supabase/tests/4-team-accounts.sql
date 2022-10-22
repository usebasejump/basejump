BEGIN;

select plan(30);

select has_table('public', 'accounts', 'Accounts table should exist');

-- make sure we're setup for enabling personal accounts
update basejump.config set enable_team_accounts = true;

--- we insert a user into auth.users and return the id into user_id to use
INSERT INTO auth.users (email, id) VALUES ('test@test.com', '1009e39a-fa61-4aab-a762-e7b1f3b014f3');
INSERT INTO auth.users (email, id) VALUES('test2@test.com', '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59');
INSERT INTO auth.users (email, id) VALUES('test_member@test.com', '813748e9-8985-45c6-ad6d-01ab38db96fe');
INSERT INTO auth.users (email, id) VALUES('test_owner@test.com', 'b4fc5df3-fa82-406b-bbd8-dba314155518');
INSERT INTO auth.users (email, id) VALUES('test_random_owner@test.com', '1950018d-3893-4d5d-ba00-47494af88c99');

--- start acting as an authenticated user
set local search_path = core, public, extensions;
set local role authenticated;

-- setup inaccessible tests for a known account ID
set local "request.jwt.claims" to '{ "sub": "1950018d-3893-4d5d-ba00-47494af88c99", "email": "test_random_owner@test.com" }';
insert into accounts (id, team_name, personal_account) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'nobody in test can access me', false);

------------
--- Primary Owner
------------
set local "request.jwt.claims" to '{ "sub": "1009e39a-fa61-4aab-a762-e7b1f3b014f3", "email": "test@test.com" }';

-- should be able to create a team account when they're enabled
SELECT
	row_eq(
		$$ insert into accounts (id, team_name, personal_account) values ('8fcec130-27cd-4374-9e47-3303f9529479', 'test team', false) returning 1$$,
		ROW(1),
		'Should be able to create a new team account'
		);

-- newly created team should be owned by current user
SELECT
    row_eq(
    $$ select primary_owner_user_id from accounts where id = '8fcec130-27cd-4374-9e47-3303f9529479' $$,
    ROW('1009e39a-fa61-4aab-a762-e7b1f3b014f3'::uuid),
    'Creating a new team account should make the current user the primary owner'
    );

-- should add that user to the account as an owner
SELECT
    row_eq(
	    $$ select user_id, account_role from account_user where account_id = '8fcec130-27cd-4374-9e47-3303f9529479'::uuid $$,
	    ROW('1009e39a-fa61-4aab-a762-e7b1f3b014f3'::uuid, 'owner'::account_role),
	    'Inserting an account should also add an account_user for the current user'
    );

-- should be able to get your own role for the account
SELECT
    row_eq(
	    $$ select public.current_user_account_role('8fcec130-27cd-4374-9e47-3303f9529479') $$,
	    ROW(jsonb_build_object(
		    'account_role', 'owner',
		    'is_primary_owner', TRUE,
		    'is_personal_account', FALSE
		)),
	    'Primary owner should be able to get their own role'
	);

-- cannot change the accounts.primary_owner_user_id directly
SELECT
    throws_ok(
        $$ update accounts set primary_owner_user_id = '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59' where personal_account = false $$,
        'You do not have permission to update this field'
    );

-- cannot delete the primary_owner_user_id from the account_user table
select
    row_eq(
    $$
    	delete from account_user where user_id = '1009e39a-fa61-4aab-a762-e7b1f3b014f3';
    	select user_id from account_user where user_id = '1009e39a-fa61-4aab-a762-e7b1f3b014f3';
    $$,
    ROW('1009e39a-fa61-4aab-a762-e7b1f3b014f3'::uuid),
    'Should not be able to delete the primary_owner_user_id from the account_user table'
    );

-- owners should be able to add invitations
SELECT
    row_eq(
    $$ insert into invitations (account_id, account_role, token, invitation_type) values ('8fcec130-27cd-4374-9e47-3303f9529479', 'member', 'test_member_single_use_token', 'one-time') returning 1 $$,
    ROW(1),
    'Owners should be able to add invitations for new members'
    );

SELECT
    row_eq(
    $$ insert into invitations (account_id, account_role, token, invitation_type) values ('8fcec130-27cd-4374-9e47-3303f9529479', 'owner', 'test_owner_single_use_token', 'one-time') returning 1 $$,
    ROW(1),
    'Owners should be able to add invitations for new owners'
    );

-- should not be able to add new users directly into team accounts
SELECT
    throws_ok(
    $$ insert into account_user (account_id, account_role, user_id) values ('8fcec130-27cd-4374-9e47-3303f9529479', 'owner', '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59') $$,
    'new row violates row-level security policy for table "account_user"'
    );

-- cannot change personal_account setting no matter who you are
SELECT
    throws_ok(
    $$ update accounts set personal_account = true where id = '8fcec130-27cd-4374-9e47-3303f9529479' $$,
    'You do not have permission to update this field'
    );

-- owner can update their team name
SELECT
    results_eq(
    $$ update accounts set team_name = 'test' where id = '8fcec130-27cd-4374-9e47-3303f9529479' returning team_name $$,
    $$ values('test') $$,
    'Owner can update their team name'
    );

-- all accounts (personal and team) should be returned by get_accounts_for_current_user test
SELECT
    ok(
    (select '8fcec130-27cd-4374-9e47-3303f9529479' IN (select basejump.get_accounts_for_current_user())),
    'Team account should be returned by the basejump.get_accounts_for_current_user function'
    );

-- shouoldn't return any accounts if you're not a member of
SELECT
    ok(
    (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' NOT IN (select basejump.get_accounts_for_current_user())),
    'Team accounts not a member of should NOT be returned by the basejump.get_accounts_for_current_user function'
    );

-----------
--- Account User Setup
-----------
set role postgres;
set local "request.jwt.claims" to '';

-- insert account_user for the member test
insert into account_user (account_id, account_role, user_id) values ('8fcec130-27cd-4374-9e47-3303f9529479', 'member', '813748e9-8985-45c6-ad6d-01ab38db96fe');
-- insert account_user for the owner test
insert into account_user (account_id, account_role, user_id) values ('8fcec130-27cd-4374-9e47-3303f9529479', 'owner', 'b4fc5df3-fa82-406b-bbd8-dba314155518');

-----------
--- Member
-----------
set role authenticated;
set local "request.jwt.claims" to '{ "sub": "813748e9-8985-45c6-ad6d-01ab38db96fe", "email": "test_member@test.com" }';

-- should now have access to the account
SELECT
    is(
    (select count(*)::int from accounts where id = '8fcec130-27cd-4374-9e47-3303f9529479'),
    1,
    'Should now have access to the account'
    );

-- members cannot update account info
SELECT
    results_ne(
    $$ update accounts set team_name = 'test' where id = '8fcec130-27cd-4374-9e47-3303f9529479' returning 1 $$,
    $$ values(1) $$,
    'Member cannot can update their team name'
    );

-- account_user should have a role of member
SELECT
    row_eq(
    $$ select account_role from account_user where account_id = '8fcec130-27cd-4374-9e47-3303f9529479' and user_id = '813748e9-8985-45c6-ad6d-01ab38db96fe'$$,
    ROW('member'::account_role),
    'Should have the correct account role after accepting an invitation'
    );

-- should be able to get your own role for the account
SELECT
    row_eq(
        $$ select public.current_user_account_role('8fcec130-27cd-4374-9e47-3303f9529479') $$,
        ROW(jsonb_build_object(
            'account_role', 'member',
            'is_primary_owner', FALSE,
            'is_personal_account', FALSE
        )),
        'Member should be able to get their own role'
    );

-- Should NOT show up as an owner in the permissions check
SELECT
    ok(
    (select '8fcec130-27cd-4374-9e47-3303f9529479' NOT IN (select basejump.get_accounts_for_current_user('owner'))),
    'Newly added account ID should not be in the list of accounts returned by basejump.get_accounts_for_current_user("owner")'
    );

-- Should be able ot get a full list of accounts when no permission passed in
SELECT
    ok(
        (select '8fcec130-27cd-4374-9e47-3303f9529479' IN (select basejump.get_accounts_for_current_user())),
        'Newly added account ID should be in the list of accounts returned by basejump.get_accounts_for_current_user()'
    );


-----------
--- Non-Primary Owner
-----------
set role authenticated;
set local "request.jwt.claims" to '{ "sub": "b4fc5df3-fa82-406b-bbd8-dba314155518", "email": "test_owner@test.com" }';

-- should now have access to the account
SELECT
    is(
    (select count(*)::int from accounts where id = '8fcec130-27cd-4374-9e47-3303f9529479'),
    1,
    'Should now have access to the account'
    );

-- account_user should have a role of member
SELECT
    row_eq(
    $$ select account_role from account_user where account_id = '8fcec130-27cd-4374-9e47-3303f9529479' and user_id = 'b4fc5df3-fa82-406b-bbd8-dba314155518'$$,
    ROW('owner'::account_role),
    'Should have the expected account role'
    );

-- should be able to get your own role for the account
SELECT
    row_eq(
        $$ select public.current_user_account_role('8fcec130-27cd-4374-9e47-3303f9529479') $$,
        ROW(jsonb_build_object(
            'account_role', 'owner',
            'is_primary_owner', FALSE,
            'is_personal_account', FALSE
        )),
        'Owner should be able to get their own role'
    );

-- Should NOT show up as an owner in the permissions check
SELECT
    ok(
    (select '8fcec130-27cd-4374-9e47-3303f9529479' IN (select basejump.get_accounts_for_current_user('owner'))),
    'Newly added account ID should not be in the list of accounts returned by basejump.get_accounts_for_current_user("owner")'
    );

-- Should be able ot get a full list of accounts when no permission passed in
SELECT
    ok(
        (select '8fcec130-27cd-4374-9e47-3303f9529479' IN (select basejump.get_accounts_for_current_user())),
        'Newly added account ID should be in the list of accounts returned by basejump.get_accounts_for_current_user()'
    );

SELECT
    results_eq(
    $$ update accounts set team_name = 'test2' where id = '8fcec130-27cd-4374-9e47-3303f9529479' returning team_name $$,
    $$ values('test2') $$,
    'New owners can update their team name'
    );

-----------
-- Strangers
----------

set local "request.jwt.claims" to '{ "sub": "5d94cce7-054f-4d01-a9ec-51e7b7ba8d59", "email": "test2@test.com" }';

-- non members / owner cannot update team name
SELECT
    results_ne(
    $$ update accounts set team_name = 'test3' where id = '8fcec130-27cd-4374-9e47-3303f9529479' returning 1$$,
    $$ select 1 $$
    );
-- non member / owner should receive no results from accounts
SELECT
    is(
    (select count(*)::int from accounts where personal_account = false),
    0,
    'Non members / owner should receive no results from accounts'
    );

--------------
-- Anonymous
--------------
set local role anon;
set local "request.jwt.claims" to '';

-- anonymous should receive no results from accounts
SELECT
    is_empty(
    $$ select * from accounts $$,
    'Anonymous should receive no results from accounts'
    );

-- anonymous cannot update team name
SELECT
    results_ne(
    $$ update accounts set team_name = 'test' returning 1 $$,
    $$ select 1 $$,
    'new row violates row-level security policy for table "invitations"'
    );

SELECT * FROM finish();

ROLLBACK;