BEGIN;
create extension if not exists "basejump-supabase_test_helpers" version '0.0.6';

select plan(2);

-- make sure we're not setup for automatic personal team account creation
update basejump.config
set enable_automatic_personal_team = false;

--- we insert a user into auth.users and return the id into user_id to use

select tests.create_supabase_user('test1', 'test1@test.com');
select tests.create_supabase_user('test2');

select tests.create_supabase_user('test3', 'test3@test.com');
select tests.create_supabase_user('test4', 'test4@test.com');


------------
--- Primary Owner
------------
select tests.authenticate_as('test1');

-- should not create any personal account automatically
SELECT is_empty(
               $$ select name from basejump.accounts limit 1 $$,
               'Inserting a user should create a personal account when personal accounts are enabled'
           );

-- should have not created accounts that are personal
SELECT is_empty(
                $$ select name from basejump.accounts where personal_account = true limit 1 $$,
               'Should not have created personal accounts'
           );

SELECT *
FROM finish();

ROLLBACK;