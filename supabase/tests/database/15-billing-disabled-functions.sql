BEGIN;
CREATE EXTENSION "basejump-supabase_test_helpers";

update basejump.config
set enable_account_billing = FALSE;

--TODO: Remove once this is moved into supabase_test_helpers
GRANT USAGE ON SCHEMA tests TO service_role;
grant execute on all functions in schema tests to service_role;

select plan(1);


select tests.create_supabase_user('test1');
select tests.authenticate_as('test1');

insert into basejump.accounts (id, slug, name)
values ('00000000-0000-0000-0000-000000000000', 'my-known-account', 'My Known Account');

insert into basejump.accounts (id, slug, name)
values ('00000000-0000-0000-0000-000000000001', 'my-known-account-2', 'My Known Account 2');

select tests.authenticate_as('test1');

select row_eq(
               $$ select get_account_billing_status('00000000-0000-0000-0000-000000000000') $$,
               ROW ('{
                 "account_role": "owner",
                 "is_primary_owner": true,
                 "is_personal_account": false,
                 "billing_enabled": false
               }'::jsonb),
               'get_account_billing_status should handle disabled billing correctly'
           );

SELECT *
FROM finish();

ROLLBACK;