/***
 * THESE FUNCTIONS ARE FOR TESTING PURPOSES ONLY.
 * TO SETUP ON YOUR OWN, HEAD TO https://usebasejump.com
 */
import {serve} from "https://deno.land/std@0.168.0/http/server.ts";
import {billingFunctionsWrapper, stripeFunctionHandler} from "../deno-packages/billing-functions/mod.ts";

import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";

const stripeClient = new Stripe(Deno.env.get("STRIPE_API_KEY") as string, {
    // This is needed to use the Fetch API rather than relying on the Node http
    // package.
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const stripeHandler = stripeFunctionHandler({
    stripeClient,
    defaultPlanId: Deno.env.get("STRIPE_DEFAULT_PLAN_ID") as string,
    defaultTrialDays: Deno.env.get("STRIPE_DEFAULT_TRIAL_DAYS") ? Number(Deno.env.get("STRIPE_DEFAULT_TRIAL_DAYS")) : undefined
});

const billingEndpoint = billingFunctionsWrapper(stripeHandler, {
    allowedURLs: ['http://127.0.0.1:54323']
});

serve(async (req) => {
    const response = await billingEndpoint(req);

    return response;
});
