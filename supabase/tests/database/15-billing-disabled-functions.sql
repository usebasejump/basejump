BEGIN;
create extension "basejump-supabase_test_helpers" version '0.0.6';

update basejump.config
set enable_personal_account_billing = FALSE,
    enable_team_account_billing     = FALSE;

select plan(6);


select tests.create_supabase_user('test1', 'test@test.com');
select tests.authenticate_as('test1');

insert into basejump.accounts (id, slug, name)
values ('00000000-0000-0000-0000-000000000000', 'my-known-account', 'My Known Account');

insert into basejump.accounts (id, slug, name)
values ('00000000-0000-0000-0000-000000000001', 'my-known-account-2', 'My Known Account 2');

select tests.authenticate_as('test1');

select row_eq(
               $$ select get_account_billing_status('00000000-0000-0000-0000-000000000000') $$,
               ROW ('{
                 "account_id": "00000000-0000-0000-0000-000000000000",
                 "account_role": "owner",
                 "billing_email": "test@test.com",
                 "billing_status": null,
                 "billing_enabled": false,
                 "billing_provider": "stripe",
                 "is_primary_owner": true,
                 "billing_customer_id": null,
                 "is_personal_account": false,
                 "billing_subscription_id": null
               }'::jsonb),
               'get_account_billing_status should handle disabled billing correctly'
           );

select row_eq(
               $$ select (get_account_billing_status((get_personal_account() ->> 'account_id')::uuid) ->> 'billing_enabled')::boolean $$,
               ROW (FALSE),
               'get_account_billing_status should handle disabled billing correctly'
           );

-- try enabling personal account billing but not team
select tests.clear_authentication();
set role postgres;

update basejump.config
set enable_personal_account_billing = TRUE,
    enable_team_account_billing     = FALSE;

select tests.authenticate_as('test1');

select row_eq(
               $$ select get_account_billing_status('00000000-0000-0000-0000-000000000000') $$,
               ROW ('{
                 "account_id": "00000000-0000-0000-0000-000000000000",
                 "account_role": "owner",
                 "billing_email": "test@test.com",
                 "billing_status": null,
                 "billing_enabled": false,
                 "billing_provider": "stripe",
                 "is_primary_owner": true,
                 "billing_customer_id": null,
                 "is_personal_account": false,
                 "billing_subscription_id": null
               }'::jsonb),
               'get_account_billing_status should handle disabled billing correctly'
           );

select row_eq(
               $$ select (get_account_billing_status((get_personal_account() ->> 'account_id')::uuid) ->> 'billing_enabled')::boolean $$,
               ROW (TRUE),
               'get_account_billing_status should handle enabled personal account billing correctly'
           );

--- enable team account billing but not personal
select tests.clear_authentication();
set role postgres;

update basejump.config
set enable_personal_account_billing = FALSE,
    enable_team_account_billing     = TRUE;

select tests.authenticate_as('test1');

select row_eq(
               $$ select get_account_billing_status('00000000-0000-0000-0000-000000000000') $$,
               ROW ('{
                 "account_id": "00000000-0000-0000-0000-000000000000",
                 "account_role": "owner",
                 "billing_email": "test@test.com",
                 "billing_status": null,
                 "billing_enabled": true,
                 "billing_provider": "stripe",
                 "is_primary_owner": true,
                 "billing_customer_id": null,
                 "is_personal_account": false,
                 "billing_subscription_id": null
               }'::jsonb),
               'get_account_billing_status should handle enabled team billing correctly'
           );

select row_eq(
               $$ select (get_account_billing_status((get_personal_account() ->> 'account_id')::uuid) ->> 'billing_enabled')::boolean $$,
               ROW (FALSE),
               'get_account_billing_status should handle disabled billing correctly'
           );

SELECT *
FROM finish();

ROLLBACK;