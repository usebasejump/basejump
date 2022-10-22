BEGIN;

select plan(1);

-- make sure we're setup for enabling personal accounts
update basejump.config set enable_team_accounts = false;

--- we insert a user into auth.users and return the id into user_id to use
INSERT INTO auth.users (email, id) VALUES ('test@test.com', '1009e39a-fa61-4aab-a762-e7b1f3b014f3');

------------
--- Primary Owner
------------
set local search_path = core, public, extensions;
set local role authenticated;
set local "request.jwt.claims" to '{ "sub": "1009e39a-fa61-4aab-a762-e7b1f3b014f3", "email": "test@test.com" }';

-- check to see if we can create an accoiunt
select throws_ok(
        $$ insert into accounts (team_name, personal_account) values ('test team', false) $$,
        'new row violates row-level security policy for table "accounts"'
    );

SELECT * FROM finish();

ROLLBACK;