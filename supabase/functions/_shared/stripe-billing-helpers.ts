import stripe from "./stripe-client.ts";
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";
import supabaseAdmin from "./supabase-admin-client.ts";
import { Database } from "./types/supabase.ts";

const BILLING_PROVIDER: Database["public"]["Tables"]["billing_subscriptions"]["Row"]["provider"] =
  "stripe";

/**
 * Returns the ISO string when given a unix timestamp
 * @param unixTime
 */
function unixToIso(unixTime: number) {
  return new Date(unixTime * 1000).toISOString();
}

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
    provider: BILLING_PROVIDER,
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
}): Promise<string> => {
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
  if (data) return data.customer_id!;

  throw "Unable to create customer";
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
  customer_id: string;
  billing_email?: string;
};

const createOrRetrieveSubscription = async ({
  accountId,
  email,
}: {
  accountId: string;
  email: string;
}): Promise<CreateOrRetrieveSubscriptionResponse | undefined> => {
  const { data, error }: { data: any; error: any } = await supabaseAdmin
    .rpc("get_account_billing_status", { lookup_account_id: accountId })
    .single();

  if (!error && data) {
    return {
      id: data["id"],
      status: data["status"],
      billing_email: data["billing_email"],
      customer_id: data["customer_id"],
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
    const { data: config }: { data: any } = await supabaseAdmin
      .rpc("get_service_role_config")
      .single();

    if (!config.stripe_default_account_price_id) {
      return;
    }

    const price = await stripe.prices.retrieve(
      config.stripe_default_account_price_id
    );

    if (
      !price ||
      (price.unit_amount > 0 && !config["stripe_default_trial_period_days"])
    ) {
      return;
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
      ? unixToIso(subscription.cancel_at)
      : null,
    canceled_at: subscription.canceled_at
      ? unixToIso(subscription.canceled_at)
      : null,
    current_period_start: new Date(
      subscription.current_period_start
    ).toISOString(),
    current_period_end: unixToIso(subscription.current_period_end),
    created: unixToIso(subscription.created),
    ended_at: subscription.ended_at ? unixToIso(subscription.ended_at) : null,
    trial_start: subscription.trial_start
      ? unixToIso(subscription.trial_start)
      : null,
    trial_end: subscription.trial_end
      ? unixToIso(subscription.trial_end)
      : null,
    provider: BILLING_PROVIDER,
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
  upsertSubscriptionRecord,
  createOrRetrieveCustomer,
  createOrRetrieveSubscription,
  upsertCustomerRecord,
  manageSubscriptionStatusChange,
};
