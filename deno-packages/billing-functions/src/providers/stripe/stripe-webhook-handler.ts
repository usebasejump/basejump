import { Stripe } from "../../../deps.ts";
import { stripeCustomerToBasejumpCustomer } from "./billing-functions/stripe-utils.ts";
import { upsertCustomerSubscription } from "../../../lib/upsert-data.ts";
import findOrCreateSubscription from "./billing-functions/find-or-create-subscription.ts";

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const relevantEvents = new Set([
  "checkout.session.completed",
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
  supabaseClient: any;
};

export async function stripeWebhookHandler({
  stripeClient,
  stripeWebhookSigningSecret,
  supabaseClient,
}: Props): (req: Request) => Promise<Response> {
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
      return new Response("Event not relevant", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

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
        await upsertCustomerSubscription(supabaseClient, accountId, {
          provider: "stripe",
          customer,
        });
        break;
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
        await upsertCustomerSubscription(supabaseClient, accountId, {
          provider: "stripe",
          subscription,
        });
        break;
      }
      case "checkout.session.completed": {
        const checkoutSession = receivedEvent.data
          .object as Stripe.Checkout.Session;
        if (checkoutSession.mode === "subscription") {
          const subscriptionId = checkoutSession.subscription;
          const subscription = await findOrCreateSubscription(stripeClient, {
            subscriptionId,
          });
          const accountId = subscription.account_id;
          await upsertCustomerSubscription(supabaseClient, accountId, {
            provider: "stripe",
            subscription,
          });
        }
        break;
      }
      default:
        throw new Error("Unhandled relevant event!");
    }
  };
}
