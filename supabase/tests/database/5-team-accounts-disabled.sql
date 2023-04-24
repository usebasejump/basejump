BEGIN;
CREATE EXTENSION "basejump-supabase_test_helpers";

select plan(1);

-- make sure we're setup for enabling personal accounts
update basejump.config
set enable_team_accounts = false;

--- we insert a user into auth.users and return the id into user_id to use
select tests.create_supabase_user('test1');

------------
--- Primary Owner
------------
select tests.authenticate_as('test1');

-- check to see if we can create an accoiunt
select throws_ok(
               $$ insert into accounts (team_name, personal_account) values ('test team', false) $$,
               'new row violates row-level security policy for table "accounts"'
           );

SELECT *
FROM finish();

ROLLBACK;