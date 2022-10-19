BEGIN;

select plan(2);

select has_table('public', 'accounts', 'Accounts table should exist');

-- make sure we're setup for enabling personal accounts
update basejump.config set enable_personal_accounts = true;

--- we insert a user into auth.users and return the id into user_id to use
INSERT INTO auth.users (email, id) VALUES ('test@test.com', '1009e39a-fa61-4aab-a762-e7b1f3b014f3');

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

------------
--- Primary Owner
------------
set local search_path = core, public;
set local role authenticated;
set local "request.jwt.claim.user_id" to '1009e39a-fa61-4aab-a762-e7b1f3b014f3'::uuid;


-- should not be able to add invitations to personal accounts
SELECT
    throws_ok(
    $$ insert into invitations (account_id, account_role, token, invitation_type) values ((select id from accounts where personal_account = true), 'owner', 'test', 'one-time') $$,
    'Cannot add invitations to personal accounts'
    );

-- should not be able to add new users to personal accounts
SELECT
    throws_ok(
    $$ insert into account_user (account_id, account_role, user_id) values ((select id from accounts where personal_account = true), 'owner', '1009e39a-fa61-4aab-a762-e7b1f3b014f3') $$,
    'Cannot add new users directly to personal accounts'
    );

-- cannot change personal_account setting no matter who you are
SELECT
    throws_ok(
    $$ update accounts set personal_account = false where id = (select id from accounts where personal_account = true) $$,
    'Cannot change personal_account setting'
    );

-- owner can update their team name
SELECT
    row_eq(
    $$ update accounts set team_name = 'test' where id = (select id from accounts where personal_account = true) returning team_name $$,
    ROW('test'),
    'Owner can update their team name'
    );

-----------
-- Strangers
----------
set local "request.jwt.claim.user_id" to '1009e49a-fa61-4aab-a762-e7b1f3b014f3'::uuid;
-- non members / owner cannot update team name
SELECT
    throws_ok(
    $$ update accounts set team_name = 'test' where id = (select id from accounts where personal_account = true) $$,
    'Non members / owner cannot update team name'
    );
-- non member / owner should receive no results from accounts
SELECT
    is_empty(
    $$ select * from accounts where id = (select id from accounts where personal_account = true) $$,
    'Non members / owner should receive no results from accounts'
    );


--------------
-- Anonymous
--------------
set local role anon;
set local "request.jwt.claim.user_id" to null;

-- anonymous should receive no results from accounts
SELECT
    is_empty(
    $$ select * from accounts where id = (select id from accounts where personal_account = true) $$,
    'Anonymous should receive no results from accounts'
    );

-- anonymous cannot update team name
SELECT
    throws_ok(
    $$ update accounts set team_name = 'test' where id = (select id from accounts where personal_account = true) $$,
    'Anonymous cannot update team name'
    );

SELECT * FROM finish();

ROLLBACK;