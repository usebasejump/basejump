BEGIN;
CREATE EXTENSION "basejump-supabase_test_helpers";

-- TODO: Remove once this is moved into supabase_test_helpers
GRANT USAGE ON SCHEMA tests TO service_role;
grant execute on all functions in schema tests to service_role;

select plan(14);

select tests.create_supabase_user('test1');
select tests.create_supabase_user('test2');

set role service_role;

select row_eq(
               $$ select (public.get_profile(tests.get_supabase_uid('test1')) ->> 'user_id')::uuid $$,
               ROW (tests.get_supabase_uid('test1')),
               'get_profile() returns the correct user_id when acting as a service account'
           );

select tests.authenticate_as('test1');

select row_eq(
               $$select public.get_profile() ->> 'user_id'$$,
               ROW (tests.get_supabase_uid('test1')::text),
               'get_profile() returns the current users info when authenticated and not giving a user ID'
           );


select throws_ok(
               $$select public.get_profile(tests.get_supabase_uid('test2'))$$,
               'Not found',
               'get_profile() throws an error if trying to get another users info you dont have access to'
           );

insert into basejump.accounts (id, slug, team_name)
values ('00000000-0000-0000-0000-000000000000', 'my-known-account', 'My Known Account');

select tests.clear_authentication();
set role postgres;

insert into basejump.account_user (account_id, account_role, user_id)
values ('00000000-0000-0000-0000-000000000000', 'member', tests.get_supabase_uid('test2'));

select tests.authenticate_as('test1');

select row_eq(
               $$select public.get_profile(tests.get_supabase_uid('test2')) ->> 'user_id'$$,
               ROW (tests.get_supabase_uid('test2')::text),
               'get_profile() returns info on team members'
           );

select update_profile(name => 'My new name!');

select is(
               (select name from basejump.profiles where id = tests.get_supabase_uid('test1')),
               'My new name!',
               'Updating name should have been successful for the user'
           );


select throws_ok(
               $$select update_profile(user_id => tests.get_supabase_uid('test2'), name => 'My new name!')$$,
               'Unauthorized',
               'Updating name should have failed for the service account'
           );

select update_profile(public_metadata => jsonb_build_object('foo', 'bar'));

select is(
               (select public_metadata from basejump.profiles where id = tests.get_supabase_uid('test1')),
               '{
                 "foo": "bar"
               }'::jsonb,
               'Updating meta should have been successful for the owner'
           );

select update_profile(public_metadata => jsonb_build_object('foo', 'bar2'));

select is(
               (select public_metadata from basejump.profiles where id = tests.get_supabase_uid('test1')),
               '{
                 "foo": "bar2"
               }'::jsonb,
               'Updating meta should have been successful for the owner'
           );

select update_profile(public_metadata => jsonb_build_object('foo2', 'bar'));

select is(
               (select public_metadata from basejump.profiles where id = tests.get_supabase_uid('test1')),
               '{
                 "foo": "bar2",
                 "foo2": "bar"
               }'::jsonb,
               'Updating meta should have merged by default'
           );

select update_profile(public_metadata => jsonb_build_object('foo3', 'bar'),
                      replace_metadata => true);

select is(
               (select public_metadata from basejump.profiles where id = tests.get_supabase_uid('test1')),
               '{
                 "foo3": "bar"
               }'::jsonb,
               'Updating meta should support replacing when you want'
           );

-- get_profile should return public metadata
select is(
               (select (get_profile() ->> 'metadata')::jsonb),
               '{
                 "foo3": "bar"
               }'::jsonb,
               'get_profile should return public metadata'
           );

select update_profile(name => 'My Updated profile Name 2');

select is(
               (select public_metadata from basejump.profiles where id = tests.get_supabase_uid('test1')),
               '{
                 "foo3": "bar"
               }'::jsonb,
               'Updating other fields should not affect public metadata'
           );

select tests.authenticate_as('test2');

select update_profile(name => 'My second user new name!');

select is(
               (select name from basejump.profiles where id = tests.get_supabase_uid('test2')),
               'My second user new name!',
               'Updating name should have been successful for the user'
           );

select tests.clear_authentication();
set role service_role;

select update_profile(user_id => tests.get_supabase_uid('test2'), name => 'My second user new name!');

select is(
               (select name from basejump.profiles where id = tests.get_supabase_uid('test2')),
               'My second user new name!',
               'Updating name should have been successful for the user'
           );

SELECT *
FROM finish();

ROLLBACK;