create type basejump.billing_providers as enum ('stripe');

/**
 * CUSTOMERS
 * Note: this is a private table that contains a mapping of user IDs to Strip customer IDs.
 */
create table basejump.billing_customers
(
    -- UUID from auth.users
    account_id uuid references basejump.accounts not null,
    -- The user's customer ID in Stripe. User must not be able to update this.
    id         text primary key,
    -- The email address the customer wants to use for invoicing
    email      text,
    -- The active status of a customer
    active     boolean,
    -- The billing provider the customer is using
    provider   basejump.billing_providers
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE basejump.billing_customers TO service_role;
GRANT SELECT ON TABLE basejump.billing_customers TO authenticated;



alter table
    basejump.billing_customers
    enable row level security;

create policy "Can only view own customer data." on basejump.billing_customers for
    select
    using (account_id IN
           (SELECT basejump.get_accounts_with_current_user_role() AS get_accounts_with_current_user_role));

/**
 * SUBSCRIPTIONS
 * Note: subscriptions are created and managed in Stripe and synced to our DB via Stripe webhooks.
 */
create type basejump.subscription_status as enum (
    'trialing',
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'unpaid'
    );

create table basejump.billing_subscriptions
(
    -- Subscription ID from Stripe, e.g. sub_1234.
    id                   text primary key,
    account_id           uuid references basejump.accounts                               not null,
    billing_customer_id  text references basejump.billing_customers (id)                 not null,
    -- The status of the subscription object, one of subscription_status type above.
    status               basejump.subscription_status,
    -- Set of key-value pairs, used to store additional information about the object in a structured format.
    metadata             jsonb,
    -- ID of the price that created this subscription.
    price_id             text,
    plan_name            text,
    -- Quantity multiplied by the unit amount of the price creates the amount of the subscription. Can be used to charge multiple seats.
    quantity             integer,
    -- If true the subscription has been canceled by the user and will be deleted at the end of the billing period.
    cancel_at_period_end boolean,
    -- Time at which the subscription was created.
    created              timestamp with time zone default timezone('utc' :: text, now()) not null,
    -- Start of the current period that the subscription has been invoiced for.
    current_period_start timestamp with time zone default timezone('utc' :: text, now()) not null,
    -- End of the current period that the subscription has been invoiced for. At the end of this period, a new invoice will be created.
    current_period_end   timestamp with time zone default timezone('utc' :: text, now()) not null,
    -- If the subscription has ended, the timestamp of the date the subscription ended.
    ended_at             timestamp with time zone default timezone('utc' :: text, now()),
    -- A date in the future at which the subscription will automatically get canceled.
    cancel_at            timestamp with time zone default timezone('utc' :: text, now()),
    -- If the subscription has been canceled, the date of that cancellation. If the subscription was canceled with `cancel_at_period_end`, `canceled_at` will still reflect the date of the initial cancellation request, not the end of the subscription period when the subscription is automatically moved to a canceled state.
    canceled_at          timestamp with time zone default timezone('utc' :: text, now()),
    -- If the subscription has a trial, the beginning of that trial.
    trial_start          timestamp with time zone default timezone('utc' :: text, now()),
    -- If the subscription has a trial, the end of that trial.
    trial_end            timestamp with time zone default timezone('utc' :: text, now()),
    provider             basejump.billing_providers
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE basejump.billing_subscriptions TO service_role;
GRANT SELECT ON TABLE basejump.billing_subscriptions TO authenticated;

alter table
    basejump.billing_subscriptions
    enable row level security;

create policy "Can only view own subs data." on basejump.billing_subscriptions for
    select
    using (account_id IN
           (SELECT basejump.get_accounts_with_current_user_role() AS get_accounts_with_current_user_role));

/**
  Add config options to basejump.config to setup the stripe requirements on new accounts
 */
alter table basejump.config
    add column enable_account_billing boolean not null default true;
alter table basejump.config
    add column billing_provider basejump.billing_providers default 'stripe';
alter table basejump.config
    add column default_trial_period_days integer default 30;
alter table basejump.config
    add column default_account_plan_id text;
