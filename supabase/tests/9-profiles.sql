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

    -- user should have access to their own profile
    select
        is(
            (select name from profiles where id = '1009e39a-fa61-4aab-a762-e7b1f3b014f3'),
            'test',
            'User should have access to their own profile, profile should auto-set name to first half of email'
        );

    -- user should not have access to other profiles
    select
        is_empty(
            $$ select * from profiles where id <> '1009e39a-fa61-4aab-a762-e7b1f3b014f3' $$,
            'User should not have access to any other profiles'
        );

    -- Users should be able to update their own names
    select
        row_eq(
            $$ update profiles set name = 'test update' where id = '1009e39a-fa61-4aab-a762-e7b1f3b014f3' returning name $$,
            ROW('test update'::text),
            'User should be able to update their own name'
        );

    -- User should not be able to update other users names
    select results_ne(
        $$ update profiles set name = 'test update' where id = '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59' returning 1 $$,
        $$ values(1) $$,
        'Should not be able to update profile'
    );

    -- Create a new account so you can start sharing profiles
    insert into accounts (id, team_name, personal_account) values ('eb3a0306-7331-4c42-a580-970e7ba6a11d', 'test team', false);

    -- set role to postgres, and then insert an account_user for the second user
    set local role postgres;
    insert into account_user (account_id, user_id, account_role) values ('eb3a0306-7331-4c42-a580-970e7ba6a11d', '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59', 'owner');

    -- back to authenticated user
    set local role authenticated;

    -- User should now have access to the second profile
    select
            row_eq(
                $$ select name from profiles where id = '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59' $$,
                ROW('test2'::text),
                'User should have access to teammates profiles'
            );

    -- still can't update teammates profiles
        select results_ne(
        $$ update profiles set name = 'test update' where id = '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59' returning 1 $$,
        $$ values(1) $$,
        'Should not be able to update profile'
    );
    SELECT * FROM finish();

ROLLBACK;