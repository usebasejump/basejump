// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import supabaseUserClient from "../_shared/supabase-user-client.ts";
import supabaseAdmin from "../_shared/supabase-admin-client.ts";
import {
  createOrRetrieveCustomer,
  createOrRetrieveSubscription,
} from "../_shared/stripe-billing-helpers.ts";
import stripeClient from "../_shared/stripe-client.ts";
import billingReturnUrl from "../_shared/billing-return-url.ts";
import { corsHeaders } from "../_shared/cors-headers.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const { accountId, priceId }: { accountId: string; priceId?: string } =
    await req.json();
  if (!accountId) {
    return new Response(JSON.stringify({ error: "Missing account ID" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseClient = supabaseUserClient(req.headers.get("Authorization")!);

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  const { data }: { data: any } = await supabaseClient
    .rpc("current_user_account_role", {
      lookup_account_id: accountId,
    })
    .single();

  const { data: config }: { data: any } = await supabaseAdmin
    .rpc("get_service_role_config")
    .single();

  if (!data || !user) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (config?.enable_account_billing === false) {
    // If billing is disabled, return the account as active
    return new Response(
      JSON.stringify({
        billing_portal_url: "",
        billing_enabled: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const subscription = await createOrRetrieveSubscription({
      accountId,
      email: user.email!,
    });

    if (!subscription?.id) {
      const customerId = createOrRetrieveCustomer({
        email: user.email!,
        accountId,
      });

      if (
        !customerId ||
        (!priceId && !config.stripe_default_account_price_id)
      ) {
        throw "Invalid setup";
      }
      // this means that the user has not yet subscribed so we want to generate a checkout link
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        customer: customerId,
        line_items: [
          {
            price: priceId || config.stripe_default_account_price_id,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: billingReturnUrl(
          data.is_personal_account
            ? "/dashboard/billing"
            : `/dashboard/teams/${accountId}/settings/billing`
        ),
        cancel_url: billingReturnUrl(
          data.is_personal_account
            ? "/dashboard/billing"
            : `/dashboard/teams/${accountId}/settings/billing`
        ),
      });

      return new Response(
        JSON.stringify({
          billing_portal_url: session.url,
          billing_enabled: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // this means that we DO have a subscription ID, so just create a portal link
    const session = await stripeClient.billingPortal.sessions.create({
      customer: subscription.customer_id,
      return_url: billingReturnUrl(
        data?.is_personal_account
          ? "/dashboard/billing"
          : `/dashboard/teams/${accountId}/settings/billing`
      ),
    });
    return new Response(
      JSON.stringify({
        billing_portal_url: session.url,
        billing_enabled: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
