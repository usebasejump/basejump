import { Stripe } from "../../../../deps.ts";
import { BASEJUMP_BILLING_DATA_UPSERT } from "../../../../lib/upsert-data.ts";

function unixToIso(unixTime: number) {
  return new Date(unixTime * 1000).toISOString();
}

export function stripeCustomerToBasejumpCustomer(
  accountId: string,
  stripeCustomer: Stripe.Customer
): BASEJUMP_BILLING_DATA_UPSERT["customer"] {
  return {
    id: stripeCustomer.id,
    billing_email: stripeCustomer.email,
    account_id: accountId,
    provider: "stripe",
  };
}

export function stripeSubscriptionToBasejumpSubscription(
  accountId: string,
  subscription: Stripe.Subscription
): BASEJUMP_BILLING_DATA_UPSERT["subscription"] {
  return {
    id: subscription.id,
    account_id: accountId,
    billing_customer_id: subscription.customer,
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
    provider: "stripe",
  };
}
