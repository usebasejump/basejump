BEGIN;

select plan(1);

-- make sure we're setup for enabling personal accounts
update basejump.config set enable_personal_accounts = false;

--- we insert a user into auth.users and return the id into user_id to use
INSERT INTO auth.users (email, id) VALUES ('test@test.com', '1009e39a-fa61-4aab-a762-e7b1f3b014f3');


-- should create the personal account automatically
SELECT
    is_empty(
    $$ select * from accounts $$,
    'No personal account should be created when personal acounts are disabled'
    );

SELECT * FROM finish();

ROLLBACK;