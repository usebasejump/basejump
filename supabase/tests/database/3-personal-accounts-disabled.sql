BEGIN;
CREATE EXTENSION "basejump-supabase_test_helpers";

select plan(1);

-- make sure we're setup for enabling personal accounts
update basejump.config
set enable_personal_accounts = false;

--- we insert a user into auth.users and return the id into user_id to use
select tests.create_supabase_user('test1');


-- should create the personal account automatically
SELECT is_empty(
               $$ select * from accounts $$,
               'No personal account should be created when personal acounts are disabled'
           );

SELECT *
FROM finish();

ROLLBACK;