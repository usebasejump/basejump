BEGIN;
create extension "basejump-supabase_test_helpers" version '0.0.6';

select plan(5);

-- make sure we're setup for enabling team accounts
update basejump.config
set enable_team_accounts = true;

--- we insert a user into auth.users and return the id into user_id to use
select tests.create_supabase_user('test1');
select tests.create_supabase_user('test_member');

------------
--- Primary Owner
------------
select tests.authenticate_as('test1');

insert into basejump.accounts (id, name, slug)
values ('00000000-0000-0000-0000-000000000000', 'test', 'test');

insert into basejump.accounts (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'test', 'test2');

select is(
               (select created_by from basejump.accounts where id = '00000000-0000-0000-0000-000000000000'),
               tests.get_supabase_uid('test1'),
               'created_by is set to the user that created the account'
           );
select is(
               (select updated_by from basejump.accounts where id = '00000000-0000-0000-0000-000000000000'),
               tests.get_supabase_uid('test1'),
               'created_by is set to the user that created the account'
           );

--- test updating accounts
select tests.clear_authentication();
set role postgres;

insert into basejump.account_user (account_id, account_role, user_id)
values ('00000000-0000-0000-0000-000000000000', 'owner', tests.get_supabase_uid('test_member'));

update basejump.accounts
set name = 'test update'
where id = '00000000-0000-0000-0000-000000000001';

select is(
               (select updated_by from basejump.accounts where id = '00000000-0000-0000-0000-000000000001'),
               NULL,
               'Updtaes from postgres / service_role users set updated_by field to null'
           );

select tests.authenticate_as('test_member');

select update_account('00000000-0000-0000-0000-000000000000', slug => 'updated-slug');

select is(
               (select updated_by from basejump.accounts where id = '00000000-0000-0000-0000-000000000000'),
               tests.get_supabase_uid('test_member'),
               'updated_by is set to the user that updated the account'
           );

select is(
               (select created_by from basejump.accounts where id = '00000000-0000-0000-0000-000000000000'),
               tests.get_supabase_uid('test1'),
               'created_by is set to the user that created the account'
           );

SELECT *
FROM finish();

ROLLBACK;