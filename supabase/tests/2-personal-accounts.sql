BEGIN;

select plan(2);

DO $$
DECLARE
	user_id uuid;
BEGIN

    select has_table('public', 'accounts', 'Accounts table should exist');

    -- make sure we're setup for enabling personal accounts
    update basejump.config set enable_personal_accounts = true;

    --- we insert a user into auth.users and return the id into user_id to use
    insert into auth.users (email) values ("test@test.com") returning id into user_id;

    SELECT
        row_eq(
        'select primary_owner_user_id, team_name, personal_account order by created_at desc limit 1',
        ROW(user_id, null, true, null, null),
        'Inserting a user should create a personal account when personal accounts are enabled'
        );

END
$$;

SELECT * FROM finish();

ROLLBACK;