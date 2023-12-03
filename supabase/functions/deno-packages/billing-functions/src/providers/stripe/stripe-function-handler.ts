import {BILLING_FUNCTION_WRAPPER_HANDLERS} from "../../billing-functions-wrapper.ts";
import getPlans from "./billing-functions/get-plans.ts";
import {findOrCreateCustomer} from "./billing-functions/find-or-create-customer.ts";
import {findOrCreateSubscription} from "./billing-functions/find-or-create-subscription.ts";
import {Stripe} from "../../../deps.ts";

type Props = {
    stripeClient: Stripe.Client;
    defaultTrialDays?: number;
    defaultPlanId?: string;
};

export function stripeFunctionHandler({
                                          stripeClient,
                                          defaultTrialDays,
                                          defaultPlanId
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
                                        successUrl,
                                        cancelUrl,
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

            const trialEnd = defaultTrialDays ? Math.floor(Date.now() / 1000) + (defaultTrialDays * 24 * 60 * 60) : undefined;

            const session = await stripeClient.checkout.sessions.create({
                customer: customer.id,
                subscription_data: {
                    trial_end: trialEnd,
                    trial_settings: {
                        end_behavior: {
                            missing_payment_method: 'create_invoice' // subscription will go past_due if no payment method is added in time
                        }
                    },
                    metadata: {
                        basejump_account_id: accountId,
                    },
                    items: [
                        {
                            plan: planId || defaultPlanId
                        },
                    ],
                },
                mode: "subscription",
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    basejump_account_id: accountId,
                },
            });
            
            return {
                url: session.url,
            };
        },
        async getBillingPortalUrl({returnUrl, customerId}) {
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
