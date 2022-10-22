create type billing_providers as enum ('stripe');

/**
 * CUSTOMERS
 * Note: this is a private table that contains a mapping of user IDs to Strip customer IDs.
 */
create table billing_customers
(
    -- UUID from auth.users
    account_id  uuid references accounts not null primary key,
    -- The user's customer ID in Stripe. User must not be able to update this.
    customer_id text,
    -- The email address the customer wants to use for invoicing
    email       text,
    -- The active status of a customer
    active      boolean,
    -- The billing provider the customer is using
    provider    billing_providers
);

alter table
    billing_customers
    enable row level security;

create policy "Can only view own customer data." on billing_customers for
    select
    using (account_id IN
           (SELECT basejump.get_accounts_for_current_user() AS get_accounts_for_current_user));

-- No policies as this is a private table that the user must not have access to.
/**
 * PRODUCTS
 * Note: products are created and managed in Stripe and synced to our DB via Stripe webhooks.
 */
create table billing_products
(
    -- Product ID from Stripe, e.g. prod_1234.
    id          text primary key,
    -- Whether the product is currently available for purchase.
    active      boolean,
    -- The product's name, meant to be displayable to the customer. Whenever this product is sold via a subscription, name will show up on associated invoice line item descriptions.
    name        text,
    -- The product's description, meant to be displayable to the customer. Use this field to optionally store a long form explanation of the product being sold for your own rendering purposes.
    description text,
    -- A URL of the product image in Stripe, meant to be displayable to the customer.
    image       text,
    -- Set of key-value pairs, used to store additional information about the object in a structured format.
    metadata    jsonb,
    provider    billing_providers
);

alter table
    billing_products
    enable row level security;

create policy "Allow public read-only access." on billing_products for
    select
    using (true);

/**
 * PRICES
 * Note: prices are created and managed in Stripe and synced to our DB via Stripe webhooks.
 */
create type pricing_type as enum ('one_time', 'recurring');

create type pricing_plan_interval as enum ('day', 'week', 'month', 'year');

create table billing_prices
(
    -- Price ID from Stripe, e.g. price_1234.
    id                 text primary key,
    -- The ID of the prduct that this price belongs to.
    billing_product_id text references billing_products,
    -- Whether the price can be used for new purchases.
    active             boolean,
    -- A brief description of the price.
    description        text,
    -- The unit amount as a positive integer in the smallest currency unit (e.g., 100 cents for US$1.00 or 100 for ¥100, a zero-decimal currency).
    unit_amount        bigint,
    -- Three-letter ISO currency code, in lowercase.
    currency           text check (char_length(currency) = 3),
    -- One of `one_time` or `recurring` depending on whether the price is for a one-time purchase or a recurring (subscription) purchase.
    type               pricing_type,
    -- The frequency at which a subscription is billed. One of `day`, `week`, `month` or `year`.
    interval           pricing_plan_interval,
    -- The number of intervals (specified in the `interval` attribute) between subscription billings. For example, `interval=month` and `interval_count=3` bills every 3 months.
    interval_count     integer,
    -- Default number of trial days when subscribing a customer to this price using [`trial_from_plan=true`](https://stripe.com/docs/api#create_subscription-trial_from_plan).
    trial_period_days  integer,
    -- Set of key-value pairs, used to store additional information about the object in a structured format.
    metadata           jsonb,
    provider           billing_providers
);

alter table
    billing_prices
    enable row level security;

create policy "Allow public read-only access." on billing_prices for
    select
    using (true);

/**
 * SUBSCRIPTIONS
 * Note: subscriptions are created and managed in Stripe and synced to our DB via Stripe webhooks.
 */
create type subscription_status as enum (
    'trialing',
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'unpaid'
    );

create table billing_subscriptions
(
    -- Subscription ID from Stripe, e.g. sub_1234.
    id                   text primary key,
    account_id           uuid references accounts                                        not null,
    -- The status of the subscription object, one of subscription_status type above.
    status               subscription_status,
    -- Set of key-value pairs, used to store additional information about the object in a structured format.
    metadata             jsonb,
    -- ID of the price that created this subscription.
    price_id             text references billing_prices,
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
    provider             billing_providers
);

alter table
    billing_subscriptions
    enable row level security;

create policy "Can only view own subs data." on billing_subscriptions for
    select
    using (account_id IN
           (SELECT basejump.get_accounts_for_current_user() AS get_accounts_for_current_user));


CREATE OR REPLACE FUNCTION public.get_account_billing_status(lookup_account_id uuid)
    RETURNS json AS
$$
DECLARE
    result RECORD;
BEGIN
    select s.id,
           s.status,
           c.email as billing_email,
           p.name  as plan_name
    from billing_subscriptions s
             join billing_prices pr on pr.id = s.price_id
             join billing_products p on p.id = pr.billing_product_id
             join billing_customers c on c.account_id = s.account_id
    where s.account_id = lookup_account_id
    order by s.created desc
    limit 1
    into result;

    if result is null then
        raise 'No billing data found for account %', lookup_account_id;
    end if;

    return row_to_json(result);
END;
$$ LANGUAGE plpgsql;

grant execute on function public.get_account_billing_status(uuid) to authenticated, service_role;

/**
  Add config options to basejump.config to setup the stripe requirements on new accounts
 */
alter table basejump.config
    add column enable_account_billing boolean not null default true;
alter table basejump.config
    add column billing_provider billing_providers default 'stripe';
alter table basejump.config
    add column stripe_default_trial_period_days integer default 30;
alter table basejump.config
    add column stripe_default_account_price_id text references billing_prices;