BEGIN;

select plan(15);

select has_table('public', 'accounts', 'Accounts table should exist');

-- make sure we're setup for enabling personal accounts
update basejump.config set enable_team_accounts = true;

--- we insert a user into auth.users and return the id into user_id to use
INSERT INTO auth.users (email, id) VALUES ('test@test.com', '1009e39a-fa61-4aab-a762-e7b1f3b014f3');
INSERT INTO auth.users (email, id) VALUES('test2@test.com', '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59');

------------
--- Primary Owner
------------
set local search_path = core, public, extensions;
set local role authenticated;
set local "request.jwt.claims" to '{ "sub": "1009e39a-fa61-4aab-a762-e7b1f3b014f3", "email": "test@test.com" }';

-- should be able to create a team account when they're enabled
SELECT
	row_eq(
		$$ insert into accounts (team_name, personal_account) values ('test team', false) returning 1$$,
		ROW(1),
		'Should be able to create a new team account'
		);

-- newly created team should be owned by current user
SELECT
    row_eq(
    $$ select primary_owner_user_id from accounts where personal_account = false order by created_at desc limit 1 $$,
    ROW('1009e39a-fa61-4aab-a762-e7b1f3b014f3'::uuid),
    'Creating a new team account should make the current user the primary owner'
    );

-- should add that user to the account as an owner
SELECT
    row_eq(
	    $$ select user_id, account_id, account_role from account_user $$,
	    ROW('1009e39a-fa61-4aab-a762-e7b1f3b014f3'::uuid, (select id from accounts where personal_account = false), 'owner'::account_role),
	    'Inserting an account should also add an account_user for the current user'
    );

-- should be able to get your own role for the account
SELECT
    row_eq(
	    $$ with data as (select id from accounts where personal_account = true) select public.current_user_account_role(data.id) from data $$,
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

-- should not be able to add invitations to personal accounts
-- TODO: implement this one and remaining invitation tests
SELECT
	todo('implement tests around creating invitations, looking them up, and accepting them');

SELECT
	todo('invitations set to one-time should only be accessible once');

SELECT
	todo('invitations set to multiple user should expire after expiration date');

--SELECT
--    throws_ok(
--    $$ insert into invitations (account_id, account_role, token, invitation_type) values ((select id from accounts where personal_account = true), 'owner', 'test', 'one-time') $$,
--    'new row violates row-level security policy for table "invitations"'
--    );

-- should not be able to add new users directly into team accounts
SELECT
    throws_ok(
    $$ insert into account_user (account_id, account_role, user_id) values ((select id from accounts where personal_account = false), 'owner', '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59') $$,
    'new row violates row-level security policy for table "account_user"'
    );

-- cannot change personal_account setting no matter who you are
SELECT
    throws_ok(
    $$ update accounts set personal_account = true where personal_account = false $$,
    'You do not have permission to update this field'
    );

-- owner can update their team name
SELECT
    results_eq(
    $$ update accounts set team_name = 'test' where id = (select id from accounts where personal_account = false) returning team_name $$,
    $$ values('test') $$,
    'Owner can update their team name'
    );

-- all accounts (personal and team) should be returned by get_accounts_for_current_user test
SELECT
    results_eq(
    $$ select basejump.get_accounts_for_current_user() $$,
    $$ select id from accounts $$,
    'Personal account should be returned by the basejump.get_accounts_for_current_user function'
    );

SELECT
	todo('Implement tests for get_accounts_for_current_user("owner") to make sure it doesnt return accounts you are only a member in');

-----------
-- Strangers
----------
set local "request.jwt.claims" to '{ "sub": "5d94cce7-054f-4d01-a9ec-51e7b7ba8d59", "email": "test2@test.com" }';

-- non members / owner cannot update team name
SELECT
    results_ne(
    $$ update accounts set team_name = 'test 2' where primary_owner_user_id = '1009e39a-fa61-4aab-a762-e7b1f3b014f3' and personal_account = false returning 1$$,
    $$ select 1 $$
    );
-- non member / owner should receive no results from accounts
SELECT
    is(
    (select count(*)::int from accounts where personal_account = false),
    0,
    'Non members / owner should receive no results from accounts'
    );

SELECT
	todo('should not be able to add invitations to an account you arent an owner of even if you know the account id');

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

select
	todo('should not be able to add invitations to an account even if you know the account id');

SELECT * FROM finish();

ROLLBACK;