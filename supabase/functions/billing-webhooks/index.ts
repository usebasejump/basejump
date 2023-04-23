// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import stripeClient, { cryptoProvider } from "../_shared/stripe-client.ts";
import {
  manageSubscriptionStatusChange,
  upsertCustomerRecord,
} from "../_shared/stripe-billing-helpers.ts";
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.created",
  "customer.updated",
  "customer.deleted",
]);

serve(async (req) => {
  try {
    const signature = req.headers.get("Stripe-Signature");
    const body = await req.text();
    const receivedEvent = await stripeClient.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!,
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
      case "customer.deleted":
        await upsertCustomerRecord(
          receivedEvent.data.object as Stripe.Customer
        );
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = receivedEvent.data.object as Stripe.Subscription;
        await manageSubscriptionStatusChange(
          subscription.id,
          subscription.customer as string
        );
        break;
      case "checkout.session.completed":
        const checkoutSession = receivedEvent.data
          .object as Stripe.Checkout.Session;
        if (checkoutSession.mode === "subscription") {
          const subscriptionId = checkoutSession.subscription;
          await manageSubscriptionStatusChange(
            subscriptionId as string,
            checkoutSession.customer as string
          );
        }
        break;
      default:
        throw new Error("Unhandled relevant event!");
    }
  } catch (error) {
    console.log(`❌ Error message: ${error.message}`);
    return new Response(error.message, {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { name } = await req.json();
  const data = {
    message: `Hello ${name}!`,
  };

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
