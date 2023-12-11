BEGIN;
create extension "basejump-supabase_test_helpers" version '0.0.6';

update basejump.config
set enable_team_account_billing     = TRUE,
    enable_personal_account_billing = true;

select plan(6);

select tests.create_supabase_user('test1');
select tests.create_supabase_user('non_member');

select tests.authenticate_as('test1');

insert into basejump.accounts (id, slug, name)
values ('00000000-0000-0000-0000-000000000000', 'my-known-account', 'My Known Account');

insert into basejump.accounts (id, slug, name)
values ('00000000-0000-0000-0000-000000000001', 'my-known-account-2', 'My Known Account 2');

select tests.authenticate_as_service_role();

select public.service_role_upsert_customer_subscription('00000000-0000-0000-0000-000000000000', '{
  "id": "cus_00000000000000",
  "billing_email": "test@test.com",
  "provider": "stripe"
}'::jsonb, '{
  "id": "sub_00000000000000",
  "billing_customer_id": "cus_00000000000000",
  "status": "active",
  "metadata": "{\"foo\": \"bar\"}",
  "price_id": "price_00000000000000",
  "quantity": 1,
  "cancel_at_period_end": false,
  "created": "2021-06-10T00:00:00Z",
  "current_period_start": "2023-06-10T00:00:00Z",
  "current_period_end": "2023-07-10T00:00:00Z",
  "ended_at": null,
  "cancel_at": null,
  "canceled_at": null,
  "trial_start": null,
  "trial_end": null,
  "plan_name": "Plan Name",
  "provider": "stripe"
}'::jsonb);


select public.service_role_upsert_customer_subscription('00000000-0000-0000-0000-000000000001', '{
  "id": "cus_00000000000001",
  "billing_email": "test@test.com",
  "provider": "stripe"
}'::jsonb, '{
  "id": "sub_00000000000001",
  "billing_customer_id": "cus_00000000000001",
  "status": "active",
  "price_id": "price_00000000000000",
  "quantity": 1,
  "cancel_at_period_end": false,
  "created": "2021-06-10T00:00:00Z",
  "current_period_start": "2023-06-10T00:00:00Z",
  "current_period_end": "2023-07-10T00:00:00Z",
  "ended_at": null,
  "cancel_at": null,
  "canceled_at": null,
  "trial_start": null,
  "trial_end": null,
  "plan_name": "Plan Name",
  "provider": "stripe"
}'::jsonb);


select tests.authenticate_as('test1');

select row_eq(
               $$ select get_account_billing_status('00000000-0000-0000-0000-000000000000') $$,
               ROW ('{
                 "account_role": "owner",
                 "is_primary_owner": true,
                 "is_personal_account": false,
                 "account_id": "00000000-0000-0000-0000-000000000000",
                 "billing_subscription_id": "sub_00000000000000",
                 "billing_status": "active",
                 "billing_customer_id": "cus_00000000000000",
                 "billing_provider": "stripe",
                 "billing_email": "test@test.com",
                 "billing_enabled": true
               }'::jsonb),
               'get_account_billing_status should return the newly inserted data'
           );

--- test out updating customer
select tests.authenticate_as_service_role();

select public.service_role_upsert_customer_subscription('00000000-0000-0000-0000-000000000000', customer => '{
  "id": "cus_00000000000000",
  "billing_email": "test2@test.com",
  "provider": "stripe"
}'::jsonb);

select tests.authenticate_as('test1');
select row_eq(
               $$ select get_account_billing_status('00000000-0000-0000-0000-000000000000') $$,
               ROW ('{
                 "account_role": "owner",
                 "is_primary_owner": true,
                 "is_personal_account": false,
                 "account_id": "00000000-0000-0000-0000-000000000000",
                 "billing_subscription_id": "sub_00000000000000",
                 "billing_status": "active",
                 "billing_customer_id": "cus_00000000000000",
                 "billing_provider": "stripe",
                 "billing_email": "test2@test.com",
                 "billing_enabled": true
               }'::jsonb),
               'get_account_billing_status should return the newly inserted data'
           );


select tests.authenticate_as_service_role();

select public.service_role_upsert_customer_subscription('00000000-0000-0000-0000-000000000000', subscription => '{
  "id": "sub_00000000000000",
  "billing_customer_id": "cus_00000000000000",
  "status": "canceled",
  "price_id": "price_00000000000000",
  "quantity": 1,
  "cancel_at_period_end": false,
  "created": "2021-06-10T00:00:00Z",
  "current_period_start": "2023-06-10T00:00:00Z",
  "current_period_end": "2023-07-10T00:00:00Z",
  "ended_at": null,
  "cancel_at": null,
  "canceled_at": "2023-07-10T00:00:00Z",
  "trial_start": null,
  "trial_end": null,
  "plan_name": "Plan Name",
  "provider": "stripe"
}'::jsonb || jsonb_build_object('metadata', '{
  "foo2": "bar"
}'::jsonb));

select row_eq(
               $$ select metadata, canceled_at, status from basejump.billing_subscriptions where id = 'sub_00000000000000' $$,
               ROW ('{
                 "foo2": "bar"
               }'::jsonb, '2023-07-10T00:00:00Z'::timestamptz, 'canceled'::basejump.subscription_status),
               'metadata should be updated'
           );

select tests.authenticate_as('test1');
select row_eq(
               $$ select get_account_billing_status('00000000-0000-0000-0000-000000000000') $$,
               ROW ('{
                 "account_role": "owner",
                 "is_primary_owner": true,
                 "is_personal_account": false,
                 "account_id": "00000000-0000-0000-0000-000000000000",
                 "billing_subscription_id": "sub_00000000000000",
                 "billing_status": "canceled",
                 "billing_customer_id": "cus_00000000000000",
                 "billing_provider": "stripe",
                 "billing_email": "test2@test.com",
                 "billing_enabled": true
               }'::jsonb),
               'get_account_billing_status should return the newly inserted data'
           );


-- make sure nothing changes in the other one
select tests.authenticate_as('test1');
select row_eq(
               $$ select get_account_billing_status('00000000-0000-0000-0000-000000000001') $$,
               ROW ('{
                 "account_role": "owner",
                 "is_primary_owner": true,
                 "is_personal_account": false,
                 "account_id": "00000000-0000-0000-0000-000000000001",
                 "billing_subscription_id": "sub_00000000000001",
                 "billing_status": "active",
                 "billing_customer_id": "cus_00000000000001",
                 "billing_provider": "stripe",
                 "billing_email": "test@test.com",
                 "billing_enabled": true
               }'::jsonb),
               'get_account_billing_status should return the newly inserted data'
           );

select tests.authenticate_as('non_member');

SELECT throws_ok(
               $$ select get_account_billing_status('00000000-0000-0000-0000-000000000001') $$,
               'P0001'
           );

SELECT *
FROM finish();

ROLLBACK;