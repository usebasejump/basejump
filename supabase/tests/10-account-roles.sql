BEGIN;

    select plan(6);
    -- make sure we're setup for enabling personal accounts
    update basejump.config set enable_team_accounts = true;

    --- we insert a user into auth.users and return the id into user_id to use
    INSERT INTO auth.users (email, id) VALUES ('test@test.com', '1009e39a-fa61-4aab-a762-e7b1f3b014f3');
    INSERT INTO auth.users (email, id) VALUES('test2@test.com', '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59');

    --- start acting as an authenticated user
    set local search_path = core, public, extensions;
    set local role authenticated;
    set local "request.jwt.claims" to '{ "sub": "1009e39a-fa61-4aab-a762-e7b1f3b014f3", "email": "test@test.com" }';

    SELECT todo('Members cannot update any roles');
    SELECT todo('Non primary owners can update roles');
    SELECT todo('Non primary owners CANNOT change the primary owner');
    SELECT todo('Non primary owners CANNOT update the role of the primary owner');
    SELECT todo('Primary owners can change the primary owner and roles');


    SELECT * FROM finish();

ROLLBACK;