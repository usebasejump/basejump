import {Stripe} from "../../../deps.ts";
import {
  stripeCustomerToBasejumpCustomer,
  stripeSubscriptionToBasejumpSubscription
} from "./billing-functions/stripe-utils.ts";
import {BASEJUMP_BILLING_DATA_UPSERT} from "../../../lib/upsert-data.ts";

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const relevantEvents = new Set([
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "customer.created",
    "customer.updated",
    "customer.deleted",
]);

type Props = {
    stripeClient: Stripe.Client;
    stripeWebhookSigningSecret: string;
};

export function stripeWebhookHandler({
                                         stripeClient,
                                         stripeWebhookSigningSecret,
                                     }: Props): (req: Request) => Promise<BASEJUMP_BILLING_DATA_UPSERT | undefined> {
    return async (req) => {
        const signature = req.headers.get("Stripe-Signature");
        const body = await req.text();
        const receivedEvent = await stripeClient.webhooks.constructEventAsync(
            body,
            signature!,
            stripeWebhookSigningSecret,
            undefined,
            cryptoProvider
        );

        if (!relevantEvents.has(receivedEvent.type)) {
            return;
        }

        console.log('processing event', receivedEvent.type)

        switch (receivedEvent.type) {
            case "customer.created":
            case "customer.updated":
            case "customer.deleted": {
                const customerData = receivedEvent.data.object as Stripe.Customer;
                const accountId = customerData.metadata.basejump_account_id;
                if (!accountId) {
                    throw new Error(
                        "Customer created/updated/deleted event missing basejump_account_id"
                    );
                }
                const customer = stripeCustomerToBasejumpCustomer(
                    accountId,
                    customerData
                );

                return {provider: 'stripe', customer};
            }
            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted": {
                const subscriptionData = receivedEvent.data
                    .object as Stripe.Subscription;
                const accountId = subscriptionData.metadata.basejump_account_id;
                if (!accountId) {
                    throw new Error(
                        "Subscription created/updated/deleted event missing basejump_account_id"
                    );
                }

                const subscription = stripeSubscriptionToBasejumpSubscription(
                    accountId,
                    subscriptionData
                );

                return {
                    provider: "stripe",
                    subscription,
                };
            }
            default:
                throw new Error("Unhandled relevant event!");
        }
    };
}
