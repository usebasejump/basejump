import { stripe } from "./stripe";
import fromUnixTime from "date-fns/fromUnixTime";
import Stripe from "stripe";
import { supabaseAdmin } from "@/utils/admin/supabase-admin-client";
import { MANUAL_SUBSCRIPTION_REQUIRED } from "@/types/billing";

enum BILLING_PROVIDERS {
  stripe = "stripe",
}

/**
 * Products are defined in stripe, this handler takes a stripe product and
 * makes sure we have a local copy for pricing pages
 * @param product Stripe product object
 */
const upsertProductRecord = async (product: Stripe.Product) => {
  const productData = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? undefined,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
    provider: BILLING_PROVIDERS.stripe,
  };

  const { error } = await supabaseAdmin
    .from("billing_products")
    .upsert([productData]);
  if (error) throw error;
  console.log(`Product inserted/updated: ${product.id}`);
};

/**
 * Prices are defined in stripe and connected to a product
 * Products typically have 1-2 prices assigned to them, but can have unlimited
 * @param price
 */
const upsertPriceRecord = async (price: Stripe.Price) => {
  const priceData = {
    id: price.id,
    billing_product_id: typeof price.product === "string" ? price.product : "",
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? undefined,
    type: price.type,
    unit_amount: price.unit_amount ?? undefined,
    interval: price.recurring?.interval,
    interval_count: price.recurring?.interval_count,
    trial_period_days: price.recurring?.trial_period_days,
    metadata: price.metadata,
    provider: BILLING_PROVIDERS.stripe,
  };

  const { error } = await supabaseAdmin
    .from("billing_prices")
    .upsert([priceData]);
  if (error) throw error;
  console.log(`Price inserted/updated: ${price.id}`);
};

/**
 * This is the customer object inside of stripe. It should map 1:1 with accounts in most cases
 * It does NOT map back to users
 * @param customer
 * @param accountId
 */
const upsertCustomerRecord = async (
  customer: Stripe.Customer,
  accountId?: string
) => {
  const customerData = {
    account_id: accountId || customer.metadata.account_id,
    customer_id: customer.id,
    email: customer.email,
    provider: BILLING_PROVIDERS.stripe,
  };

  const { error } = await supabaseAdmin
    .from("billing_customers")
    .upsert([customerData]);
  if (error) throw error;
  console.log(`Customer inserted/updated: ${customer.id}`);
};

/**
 * Convenience function that checks if a stripe customer with a given email address already exists
 * in our database. If it doesn't, it creates a new one
 * @param accountId
 */
const createOrRetrieveCustomer = async ({
  accountId,
  email,
}: {
  accountId: string;
  email: string;
}) => {
  const { data, error } = await supabaseAdmin
    .from("billing_customers")
    .select("customer_id")
    .eq("account_id", accountId)
    .single();
  if (error) {
    // No customer record found, let's create one.
    const customerData: { metadata: { account_id: string }; email?: string } = {
      metadata: {
        account_id: accountId,
      },
    };

    if (email) {
      customerData.email = email;
    }
    const customer = await stripe.customers.create(customerData);
    // now we upsert the customer record. Upsert b/c the stripe webhook also hits this and so there could be
    // a race condition
    await upsertCustomerRecord(customer, accountId);
    console.log(`New customer created and inserted for ${accountId}.`);
    return customer.id;
  }
  if (data) return data.customer_id;
};

/**
 * Searches for an existing subscription connect to an accountID.
 * If it exists, it returns the subscription ID and status
 * if it doesn't exist, it loads the billing customer ID and then creates a new subscription
 * @param accountId
 */

type CreateOrRetrieveSubscriptionResponse = {
  id: string;
  status: string;
  plan_name?: string;
  billing_email?: string;
};

const createOrRetrieveSubscription = async ({
  accountId,
  email,
}: {
  accountId: string;
  email: string;
}): Promise<CreateOrRetrieveSubscriptionResponse> => {
  const { data, error } = await supabaseAdmin
    .rpc("get_account_billing_status", { lookup_account_id: accountId })
    .single();

  if (!error && data) {
    return {
      id: data["id"],
      status: data["status"],
      billing_email: data["billing_email"],
      plan_name: data["plan_name"],
    };
  }

  // No subscription found, let's create one.
  const customerId = await createOrRetrieveCustomer({ accountId, email });
  // search for the subscription to see if it's already been created
  // this would only happen in weird race conditions or past errors, but worth confirming
  const subscription = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
  });

  if (subscription.data.length === 1) {
    // we found a subscription, let's upsert it
    await upsertSubscriptionRecord(subscription.data[0], accountId);
    // now that we've upserted it, we want to re-call the function
    return createOrRetrieveSubscription({ accountId, email });
  }
  try {
    // load up the default billing config we want to use
    const { data: config } = await supabaseAdmin
      .rpc("get_service_role_config")
      .single();

    const { data: price } = await supabaseAdmin
      .from("billing_prices")
      .select("unit_amount")
      .eq("id", config["stripe_default_account_price_id"])
      .single();

    if (
      !price ||
      (price.unit_amount > 0 && !config["stripe_default_trial_period_days"])
    ) {
      throw new Error(MANUAL_SUBSCRIPTION_REQUIRED);
    }

    const newSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: config["stripe_default_account_price_id"] }],
      expand: ["latest_invoice.payment_intent"],
      trial_period_days: config["stripe_default_trial_period_days"],
    });
    // now we upsert the subscription record. Upsert b/c the stripe webhook also hits this and so there could b
    await upsertSubscriptionRecord(newSubscription, accountId);
    return createOrRetrieveSubscription({ accountId, email });
  } catch (error) {
    throw error;
  }
};

/**
 * Takes a stripe subscription object and upserts it into our database
 * @param subscription Stripe.Subscription
 * @param accountId string
 */
const upsertSubscriptionRecord = async (
  subscription: Stripe.Subscription,
  accountId: string
) => {
  const subscriptionData = {
    id: subscription.id,
    account_id: accountId,
    metadata: subscription.metadata,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? fromUnixTime(subscription.cancel_at).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? fromUnixTime(subscription.canceled_at).toISOString()
      : null,
    current_period_start: fromUnixTime(subscription.current_period_start).toISOString(),
    current_period_end: fromUnixTime(subscription.current_period_end).toISOString(),
    created: fromUnixTime(subscription.created).toISOString(),
    ended_at: subscription.ended_at
      ? fromUnixTime(subscription.ended_at).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? fromUnixTime(subscription.trial_start).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? fromUnixTime(subscription.trial_end).toISOString()
      : null,
    provider: BILLING_PROVIDERS.stripe,
  };

  const { error } = await supabaseAdmin
    .from("billing_subscriptions")
    .upsert(subscriptionData);
  if (error) throw error;
  console.log(
    `Inserted/updated subscription [${subscription.id}] for account [${accountId}]`
  );
};

/**
 * Subscriptions are the primary tracking for an accounts status within the app.
 * This takes a stripe subscription event and upserts it into our database so that
 * we have a local version of an accounts current status
 * @param subscriptionId
 * @param customerId
 * @param accountCreated Is this an account created event?
 */
const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string
) => {
  // Get customer's UUID from mapping table.
  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from("billing_customers")
    .select("account_id")
    .eq("customer_id", customerId)
    .single();
  if (noCustomerError) throw noCustomerError;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"],
  });
  // Upsert the latest status of the subscription object.
  await upsertSubscriptionRecord(subscription, customerData.account_id);
};

export {
  upsertProductRecord,
  upsertPriceRecord,
  upsertSubscriptionRecord,
  createOrRetrieveCustomer,
  createOrRetrieveSubscription,
  upsertCustomerRecord,
  manageSubscriptionStatusChange,
};
