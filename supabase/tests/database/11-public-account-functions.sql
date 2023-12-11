BEGIN;
create extension "basejump-supabase_test_helpers" version '0.0.6';

select plan(29);

-- make sure we're setup for the test correctly
update basejump.config
set enable_team_accounts = true;

--- we insert a user into auth.users and return the id into user_id to use
select tests.create_supabase_user('test1');
select tests.create_supabase_user('test2');
select tests.create_supabase_user('test_member');

select tests.authenticate_as('test1');
select create_account('my-account', 'My account');
select create_account(name => 'My Account 2', slug => 'my-account-2');

select is(
               (select (get_account_by_slug('my-account') ->> 'account_id')::uuid),
               (select id from basejump.accounts where slug = 'my-account'),
               'get_account_by_slug returns the correct account_id'
           );

select is(
               (select json_array_length(get_accounts())),
               3,
               'get_accounts returns 2 accounts'
           );


-- insert known account id into accounts table for testing later
insert into basejump.accounts (id, slug, name)
values ('00000000-0000-0000-0000-000000000000', 'my-known-account', 'My Known Account');

-- get_account_id should return the correct account id
select is(
               (select public.get_account_id('my-known-account')),
               '00000000-0000-0000-0000-000000000000'::uuid,
               'get_account_id should return the correct id'
           );

select is(
               (select (public.get_account('00000000-0000-0000-0000-000000000000') ->> 'account_id')::uuid),
               '00000000-0000-0000-0000-000000000000'::uuid,
               'get_account should be able to return a known account'
           );

----- updating accounts should work
select update_account('00000000-0000-0000-0000-000000000000', slug => 'my-updated-slug');

select is(
               (select slug from basejump.accounts where id = '00000000-0000-0000-0000-000000000000'),
               'my-updated-slug',
               'Updating slug should have been successful for the owner'
           );

select update_account('00000000-0000-0000-0000-000000000000', name => 'My Updated Account Name');

select is(
               (select name from basejump.accounts where id = '00000000-0000-0000-0000-000000000000'),
               'My Updated Account Name',
               'Updating team name should have been successful for the owner'
           );

select update_account('00000000-0000-0000-0000-000000000000', public_metadata => jsonb_build_object('foo', 'bar'));

select is(
               (select public_metadata from basejump.accounts where id = '00000000-0000-0000-0000-000000000000'),
               '{
                 "foo": "bar"
               }'::jsonb,
               'Updating meta should have been successful for the owner'
           );

select update_account('00000000-0000-0000-0000-000000000000', public_metadata => jsonb_build_object('foo', 'bar2'));

select is(
               (select public_metadata from basejump.accounts where id = '00000000-0000-0000-0000-000000000000'),
               '{
                 "foo": "bar2"
               }'::jsonb,
               'Updating meta should have been successful for the owner'
           );

select update_account('00000000-0000-0000-0000-000000000000', public_metadata => jsonb_build_object('foo2', 'bar'));

select is(
               (select public_metadata from basejump.accounts where id = '00000000-0000-0000-0000-000000000000'),
               '{
                 "foo": "bar2",
                 "foo2": "bar"
               }'::jsonb,
               'Updating meta should have merged by default'
           );

select update_account('00000000-0000-0000-0000-000000000000', public_metadata => jsonb_build_object('foo3', 'bar'),
                      replace_metadata => true);

select is(
               (select public_metadata from basejump.accounts where id = '00000000-0000-0000-0000-000000000000'),
               '{
                 "foo3": "bar"
               }'::jsonb,
               'Updating meta should support replacing when you want'
           );

-- get_account should return public metadata
select is(
               (select (get_account('00000000-0000-0000-0000-000000000000') ->> 'metadata')::jsonb),
               '{
                 "foo3": "bar"
               }'::jsonb,
               'get_account should return public metadata'
           );

select update_account('00000000-0000-0000-0000-000000000000', name => 'My Updated Account Name 2');

select is(
               (select public_metadata from basejump.accounts where id = '00000000-0000-0000-0000-000000000000'),
               '{
                 "foo3": "bar"
               }'::jsonb,
               'Updating other fields should not affect public metadata'
           );

--- test that we cannot update accounts we belong to but don't own

select tests.clear_authentication();
set role postgres;

insert into basejump.account_user (account_id, account_role, user_id)
values ('00000000-0000-0000-0000-000000000000', 'member', tests.get_supabase_uid('test_member'));

select tests.authenticate_as('test_member');

select throws_ok(
               $$select update_account('00000000-0000-0000-0000-000000000000', slug => 'my-updated-slug-200')$$,
               'Only account owners can update an account'
           );
-------
--- Second user
-------

select tests.authenticate_as('test2');

select throws_ok(
               $$select get_account('00000000-0000-0000-0000-000000000000')$$,
               'Not found'
           );

select throws_ok(
               $$select get_account_by_slug('my-known-account')$$,
               'Not found'
           );

select throws_ok(
               $$select current_user_account_role('00000000-0000-0000-0000-000000000000')$$,
               'Not found'
           );

select is(
               (select json_array_length(get_accounts())),
               1,
               'get_accounts returns 1 accounts (personal)'
           );

select is(
               (select get_personal_account() ->> 'account_id'),
               auth.uid()::text,
               'get_personal_account should return the correct account_id'
           );


select throws_ok($$select create_account('my-account', 'My account')$$,
                 'An account with that unique ID already exists');

select create_account('My AccOunt & 3');

select is(
               (select (get_account_by_slug('my-account-3') ->> 'account_id')::uuid),
               (select id from basejump.accounts where slug = 'my-account-3'),
               'get_account_by_slug returns the correct account_id'
           );

select is(
               (select json_array_length(get_accounts())),
               2,
               'get_accounts returns 2 accounts (personal and team)'
           );


-- Should not be able to update an account you aren't a member of

select throws_ok(
               $$select update_account('00000000-0000-0000-0000-000000000000', slug => 'my-account-new-slug')$$,
               'Not found'
           );

-- Anon users should not have access to any of these functions

select tests.clear_authentication();

select throws_ok(
               $$select get_account('00000000-0000-0000-0000-000000000000')$$,
               'permission denied for function get_account'
           );

select throws_ok(
               $$select get_account_by_slug('my-account-3')$$,
               'permission denied for function get_account_by_slug'
           );

select throws_ok(
               $$select current_user_account_role('00000000-0000-0000-0000-000000000000')$$,
               'permission denied for function current_user_account_role'
           );

select throws_ok(
               $$select get_accounts()$$,
               'permission denied for function get_accounts'
           );


---- some functions should work for service_role users
select tests.authenticate_as_service_role();

select is(
               (select (get_account('00000000-0000-0000-0000-000000000000') ->> 'account_id')::uuid),
               '00000000-0000-0000-0000-000000000000'::uuid,
               'get_account should return the correct account_id'
           );

select is(
               (select (get_account_by_slug('my-updated-slug') ->> 'account_id')::uuid),
               (select id from basejump.accounts where slug = 'my-updated-slug'),
               'get_account_by_slug returns the correct account_id'
           );

select update_account('00000000-0000-0000-0000-000000000000', slug => 'my-updated-slug-300');

select is(
               (select get_account('00000000-0000-0000-0000-000000000000') ->> 'slug'),
               'my-updated-slug-300',
               'Updating the account slug should work for service_role users'
           );

SELECT *
FROM finish();

ROLLBACK;