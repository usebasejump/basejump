insert into basejump.config (enable_personal_accounts,
                             enable_team_accounts,
                             enable_account_billing,
                             billing_provider,
                             default_trial_period_days,
                             default_account_plan_id)
values (TRUE,
        TRUE,
        FALSE,
        'stripe',
        30,
        null);