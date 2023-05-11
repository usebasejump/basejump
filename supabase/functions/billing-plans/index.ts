// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors-headers.ts";
import stripeClient from "../_shared/stripe-client.ts";
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";

type PRICE = {
  product_name: string;
  product_description: string;
  currency: string;
  price: number;
  price_id: string;
  interval: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const prices = await stripeClient.prices.list({
    expand: ["data.product"],
  });

  const cleanedPrices: PRICE[] = prices?.data?.map((price: Stripe.Price) => {
    return {
      product_name: price.product.name,
      product_description: price.product.description,
      currency: price.currency,
      price: price.unit_amount,
      price_id: price.id,
      interval:
        price.type === "one_time" ? "one_time" : price.recurring?.interval,
    };
  });

  return new Response(JSON.stringify(cleanedPrices), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
