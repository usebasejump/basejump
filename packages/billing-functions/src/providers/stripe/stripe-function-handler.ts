import { BILLING_FUNCTION_WRAPPER_HANDLERS } from "../../billing-functions-wrapper.ts";
import getPlans from "./billing-functions/get-plans.ts";
import findOrCreateCustomer from "./billing-functions/find-or-create-customer.ts";
import findOrCreateSubscription from "./billing-functions/find-or-create-subscription.ts";

type Props = {
  stripeClient: StripeClient;
};

function stripeFunctionHandler({
  stripeClient,
}: Props): BILLING_FUNCTION_WRAPPER_HANDLERS {
  return {
    provider: "stripe",
    getPlans() {
      return getPlans(stripeClient);
    },

    getBillingStatus({
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
        customerId: customer.id,
        defaultPlanId,
        accountId,
        defaultTrialDays,
      });

      return {
        customer,
        subscription,
      };
    },
    getNewSubscriptionUrl({ returnUrl, accountId, planId, billingEmail }) {},
    getBillingPortalUrl({ returnUrl, customerId }) {
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

export default stripeFunctionHandler;
