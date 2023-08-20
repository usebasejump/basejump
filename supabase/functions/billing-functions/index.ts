import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  billingFunctionsWrapper,
  stripeFunctionHandler,
} from "https://raw.githubusercontent.com/usebasejump/basejump/supabase-functions/deno-packages/billing-functions/mod.ts";

import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";

const stripeClient = new Stripe(Deno.env.get("STRIPE_API_KEY") as string, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});

const stripeHandler = stripeFunctionHandler({
  stripeClient,
});

const billingEndpoint = billingFunctionsWrapper(stripeHandler);

serve(async (req) => {
  const response = await billingEndpoint(req);

  return response;
});
