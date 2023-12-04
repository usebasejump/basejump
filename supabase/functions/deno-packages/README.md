# Basejump Edge Function Core

Convenience functions for working with Supabase Edge Functions alongside Basejump.

### Billing Endpoint

All the functionality needed to enable revenue generating on accounts within Basejump.

```typescript
import {serve} from "https://deno.land/std@0.168.0/http/server.ts";
import {
    billingEndpoint,
    stripeBillingEndpoint
} from "https://deno.land/x/basejump@v2.0.1/billing-functions/mod.ts";

const stripeResponse = stripeBillingEndpoint({
    stripeClient,
});

serve(async (req) => {
    const response = await billingEndpoint(req, stripeResponse);
    return response;
});
```

### Billing Webhooks

Webhook consumer for events from your billing provider.

```typescript
import {serve} from "https://deno.land/std@0.168.0/http/server.ts";
import {
    billingWebhookEndpoint,
    stripeBillingWebhookEndpoint
} from "https://deno.land/x/basejump@v2.0.1/billing-functions/mod.ts";

const stripeResponse = stripeBillingWebhookEndpoint({
    stripeClient,
});

serve(async (req) => {
    const response = await billingWebhookEndpoint(req, stripeResponse);
    return response;
});
```

### Requiring an account member / owner

Convenience function useful for ensuring a user should have access to a specific function.

```typescript
import {serve} from "https://deno.land/std@0.168.0/http/server.ts";
import {
    requireAccountMember
} from "https://deno.land/x/basejump@v2.0.1/billing-functions/mod.ts";

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", {headers: corsHeaders});
    }

    const body = await req.json();

    const response = await requireAccountMember(req, {
            accountId: body.account_id,
            allowedRoles: ["owner", "member"],
            onBlocked:
                () => new Response("Unauthorized", {status: 401}),
            onAuthorized:
                async (supabaseClient) => {
                    return new Response("Authorized", {status: 200});
                },
            onError:
                (error) => new Response(error.message, {status: 500}),
        })
    ;

    return response;
});

```

# Creating your own Billing adapters

Out of the box, Basejump provides support for a Stripe billing adapter. But there's no reason you can't provide your own
adapters for other services, such as Lemon Squeezy.

Billing adapters should implement a client facing Edge function for handling requests as well as a webhook edge function
for keeping subscriptions up to date.

## Custom Billing Edge function

An Edge Function responsible for handling specific requests from the client applications.

```typescript

export default function customBillingEndpoint(config) {
    return {
        async getPlans({
                           accountId, subscriptionId, customerId
                       }) {
            // Get available plans from your provider
            return {
                plans: [
                    {
                        id: "plan_123",
                        name: "Plan 123",
                        description: "Plan 123",
                        amount: 1000,
                        currency: "usd",
                        interval: "month",
                        interval_count: 1,
                        trial_period_days: 30,
                        metadata: {},
                    },
                ],
            };
        },
        async getBillingPortalUrl({accountId, subscriptionId, customerId}) {
            // load the billing portal url from your provider
            return {
                url: "https://example.com/billing-portal",
            };
        },
        async getNewSubscriptionUrl({accountId, email, planId}) {
            // load the new subscription url from your provider
            return {
                url: "https://example.com/new-subscription",
            };
        },
        async getBillingStatus({accountId, subscriptionId, customerId}) {
            // load the billing status from your provider
            return {
                customer: {
                    id: "cus_123",
                    email: "test@test.com"
                },
                subscription: {
                    id: "sub_123",
                    status: "active",
                    plan_name: "Plan 123",
                    ...
                }
            };
        },
    };
}
```

## Custom Billing Webhook function

Responsible for receiving webhooks from the billing platform and updating customer/subscription objects

```typescript

export default function customBillingWebhookEndpoint(config) {
    return {
        async handleEvent(req) {
            // handle the event from your provider
            return {
                customer: {
                    id: "cus_123",
                    email: "test@test.com"
                },
                subscription: {
                    id: "sub_123",
                    status: "active",
                    plan_name: "Plan 123",
                    ...
                }
            }
        }
    };
}
```