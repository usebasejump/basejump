BEGIN;

select plan(15);

select has_table('public', 'accounts', 'Accounts table should exist');

-- make sure we're setup for enabling personal accounts
update basejump.config set enable_personal_accounts = true;

--- we insert a user into auth.users and return the id into user_id to use
INSERT INTO auth.users (email, id) VALUES ('test@test.com', '1009e39a-fa61-4aab-a762-e7b1f3b014f3');
INSERT INTO auth.users (email, id) VALUES('test2@test.com', '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59');

------------
--- Primary Owner
------------
set local search_path = core, public, extensions;
set local role authenticated;
set local "request.jwt.claims" to '{ "sub": "1009e39a-fa61-4aab-a762-e7b1f3b014f3", "email": "test@test.com" }';

-- should create the personal account automatically
SELECT
    row_eq(
    $$ select primary_owner_user_id, personal_account from accounts order by created_at desc limit 1 $$,
    ROW('1009e39a-fa61-4aab-a762-e7b1f3b014f3'::uuid, true),
    'Inserting a user should create a personal account when personal accounts are enabled'
    );

-- should add that user to the account as an owner
SELECT
    row_eq(
	    $$ select user_id, account_id, account_role from account_user $$,
	    ROW('1009e39a-fa61-4aab-a762-e7b1f3b014f3'::uuid, (select id from accounts where personal_account = true), 'owner'::account_role),
	    'Inserting a user should also add an account_user for the created account'
    );

-- should be able to get your own role for the account
SELECT
    row_eq(
	    $$ with data as (select id from accounts where personal_account = true) select public.current_user_account_role(data.id) from data $$,
	    ROW(jsonb_build_object(
		    'account_role', 'owner',
		    'is_primary_owner', TRUE,
		    'is_personal_account', TRUE
		)),
	    'Primary owner should be able to get their own role'
	);

-- cannot change the accounts.primary_owner_user_id
SELECT
    throws_ok(
        $$ update accounts set primary_owner_user_id = '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59' where personal_account = true $$,
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
SELECT
    throws_ok(
    $$ insert into invitations (account_id, account_role, token, invitation_type) values ((select id from accounts where personal_account = true), 'owner', 'test', 'one-time') $$,
    'new row violates row-level security policy for table "invitations"'
    );

-- should not be able to add new users to personal accounts
SELECT
    throws_ok(
    $$ insert into account_user (account_id, account_role, user_id) values ((select id from accounts where personal_account = true), 'owner', '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59') $$,
    'new row violates row-level security policy for table "account_user"'
    );

-- cannot change personal_account setting no matter who you are
SELECT
    throws_ok(
    $$ update accounts set personal_account = false where personal_account = true $$,
    'You do not have permission to update this field'
    );

-- owner can update their team name
SELECT
    results_eq(
    $$ update accounts set team_name = 'test' where id = (select id from accounts where personal_account = true) returning team_name $$,
    $$ select 'test' $$,
    'Owner can update their team name'
    );

-- personal account should be returned by the basejump.get_accounts_for_current_user functoin
SELECT
    results_eq(
    $$ select basejump.get_accounts_for_current_user() $$,
    $$ select id from accounts where personal_account = true $$,
    'Personal account should be returned by the basejump.get_accounts_for_current_user function'
    );

-----------
-- Strangers
----------
set local "request.jwt.claims" to '{ "sub": "5d94cce7-054f-4d01-a9ec-51e7b7ba8d59", "email": "test2@test.com" }';

-- non members / owner cannot update team name
SELECT
    results_ne(
    $$ update accounts set team_name = 'test' where primary_owner_user_id = '1009e39a-fa61-4aab-a762-e7b1f3b014f3' returning 1$$,
    $$ select 1 $$
    );

-- non member / owner should receive no results from accounts
SELECT
    is(
    (select count(*)::int from accounts where primary_owner_user_id <> '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59'),
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