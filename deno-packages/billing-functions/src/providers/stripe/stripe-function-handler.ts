import { BILLING_FUNCTION_WRAPPER_HANDLERS } from "../../billing-functions-wrapper.ts";
import getPlans from "./billing-functions/get-plans.ts";
import { findOrCreateCustomer } from "./billing-functions/find-or-create-customer.ts";
import { findOrCreateSubscription } from "./billing-functions/find-or-create-subscription.ts";
import { Stripe } from "../../../deps.ts";

type Props = {
  stripeClient: Stripe.Client;
};

export function stripeFunctionHandler({
  stripeClient,
}: Props): BILLING_FUNCTION_WRAPPER_HANDLERS {
  return {
    provider: "stripe",
    async getPlans() {
      return getPlans(stripeClient);
    },

    async getBillingStatus({
      accountId,
      customerId,
      billingEmail,
      defaultTrialDays,
      defaultPlanId,
      subscriptionId,
    }) {
      const customer = await findOrCreateCustomer(stripeClient, {
        customerId,
        billingEmail,
        accountId,
      });

      const subscription = await findOrCreateSubscription(stripeClient, {
        subscriptionId,
        customerId: customer?.id,
        defaultPlanId,
        accountId,
        defaultTrialDays,
      });

      return {
        provider: 'stripe',
        customer,
        subscription,
      };
    },
    async getNewSubscriptionUrl({
      returnUrl,
      accountId,
      planId,
      billingEmail,
      customerId,
    }) {
      const customer = await findOrCreateCustomer(stripeClient, {
        customerId,
        billingEmail,
        accountId,
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      const session = await stripeClient.checkout.sessions.create({
        customer: customer.id,
        subscription_data: {
          metadata: {
            basejump_account_id: accountId,
          },
          items: [
            {
              plan: planId,
            },
          ],
        },
        mode: "subscription",
        success_url: returnUrl,
        cancel_url: returnUrl,
        metadata: {
          basejump_account_id: accountId,
        },
      });

      return {
        url: session.url,
      };
    },
    async getBillingPortalUrl({ returnUrl, customerId }) {
      const session = await stripeClient.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return {
        url: session.url,
      };
    },
  };
}
