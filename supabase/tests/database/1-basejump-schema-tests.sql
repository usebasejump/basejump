BEGIN;
CREATE EXTENSION "basejump-supabase_test_helpers";

select plan(22);

select has_schema('basejump', 'Basejump schema should exist');

select has_table('basejump', 'config', 'Basejump config table should exist');

select tests.rls_enabled('public');

select columns_are('basejump', 'config',
                   Array ['enable_personal_accounts', 'enable_team_accounts', 'enable_account_billing', 'billing_provider', 'stripe_default_trial_period_days', 'stripe_default_account_price_id'],
                   'Basejump config table should have the correct columns');

select ok(basejump.is_set('enable_personal_accounts')), 'Basejump config should have personal accounts enabled';
select ok(basejump.is_set('enable_team_accounts')), 'Basejump config should have team accounts enabled';
select ok((basejump.get_config() ->> 'enable_account_billing')::boolean = false,
          'Basejump config should have account billing disabled');
select ok(basejump.get_config() ->> 'billing_provider' = 'stripe',
          'Basejump config should have stripe as the billing provider');
select ok((basejump.get_config() ->> 'stripe_default_trial_period_days')::int = 30),
       'Basejump config should have a default trial period';


select function_returns('basejump', 'generate_token', Array ['integer'], 'bytea',
                        'Basejump generate_token function should exist');
select function_returns('basejump', 'trigger_set_timestamps', 'trigger',
                        'Basejump trigger_set_timestamps function should exist');

SELECT schema_privs_are('basejump', 'anon', Array [NULL], 'Anon should not have access to basejump schema');

-- set the role to anonymous for verifying access tests
set role anon;
select throws_ok('select basejump.get_config()');
select throws_ok('select basejump.is_set(''enable_personal_accounts'')');
select throws_ok('select basejump.generate_token(1)');
select throws_ok('select public.get_service_role_config()');

-- set the role to the service_role for testing access
set role service_role;
select ok(public.get_service_role_config() is not null),
       'Basejump get_service_role_config should be accessible to the service role';

-- set the role to authenticated for tests
set role authenticated;
select ok(basejump.get_config() is not null), 'Basejump get_config should be accessible to authenticated users';
select ok(basejump.is_set('enable_personal_accounts')),
       'Basejump is_set should be accessible to authenticated users';
select ok(basejump.generate_token(1) is not null),
       'Basejump generate_token should be accessible to authenticated users';
select throws_ok('select public.get_service_role_config()');
select isnt_empty('select * from basejump.config', 'authenticated users should have access to Basejump config');

SELECT *
FROM finish();

ROLLBACK;