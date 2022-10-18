BEGIN;
-- set local search_path = core, public;
-- set local role authenticated;
-- set local "request.jwt.claim.user_id" to 9;

select has_schema('basejump', 'Basejump schema should exist');

select has_table('basejump', 'config', 'Basejump config table should exist');

select columns_are('basejump', 'config', Array['enable_personal_accounts', 'enable_team_accounts', 'enable_account_billing', 'stripe_default_trial_period_days', 'stripe_default_account_price_id'], 'Basejump config table should have the correct columns');

select ok(basejump.is_set('enable_personal_accounts')), 'Basejump config should have personal accounts enabled';
select ok(basejump.is_set('enable_team_accounts')), 'Basejump config should have team accounts enabled';
select ok(basejump.is_set('enable_account_billing')), 'Basejump config should have account billing enabled';
select ok(basejump.get_config() -> 'stripe_default_trial_period_days' = 30), 'Basejump config should have a default trial period';

ROLLBACK;