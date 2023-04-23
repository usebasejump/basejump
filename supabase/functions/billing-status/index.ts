// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import supabaseUserClient from "../_shared/supabase-user-client.ts";
import supabaseAdmin from "../_shared/supabase-admin-client.ts";
import { createOrRetrieveSubscription } from "../_shared/stripe-billing-helpers.ts";
import { corsHeaders } from "../_shared/cors-headers.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const { accountId }: { accountId: string } = await req.json();
  if (!accountId) {
    return new Response(JSON.stringify({ error: "Missing acocunt ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
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
        subscription_id: null,
        subscription_active: true,
        status: "active",
        is_primary_owner: data.is_primary_owner,
        billing_email: null,
        account_role: data.account_role,
        billing_enabled: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const subscriptionData = await createOrRetrieveSubscription({
      accountId: accountId as string,
      email: user.email!,
    });

    if (!subscriptionData) {
      // this means that we didn't find an active subscription, BUT we have billing enabled
      // so we need to handle that
      return new Response(
        JSON.stringify({
          subscription_id: null,
          subscription_active: true,
          status: "missing",
          billing_email: null,
          account_role: data?.account_role,
          is_primary_owner: data?.is_primary_owner,
          billing_enabled: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        subscription_id: subscriptionData.id,
        subscription_active: ["trialing", "active"].includes(
          subscriptionData.status
        ),
        billing_email: subscriptionData.billing_email,
        status: subscriptionData.status,
        account_role: data?.account_role,
        is_primary_owner: data?.is_primary_owner,
        billing_enabled: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
