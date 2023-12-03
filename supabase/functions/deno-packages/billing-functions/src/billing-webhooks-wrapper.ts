import createSupabaseServiceClient from "../lib/create-supabase-service-client.ts";
import {BASEJUMP_BILLING_DATA_UPSERT, upsertCustomerSubscription,} from "../lib/upsert-data.ts";

export type BILLING_WEBHOOKS_WRAPPER_HANDLER = (
    req: Request
) => Promise<BASEJUMP_BILLING_DATA_UPSERT | undefined>;

export function billingWebhooksWrapper(
    handler: BILLING_WEBHOOKS_WRAPPER_HANDLER
): (req: Request) => Promise<Response> {
    return async function (req: Request) {
        try {
            const data = await handler(req);
            const accountId =
                data?.customer?.account_id || data?.subscription?.account_id;

            if (data && accountId) {
                const supabaseClient = createSupabaseServiceClient();
                // if we got data back from the webhook, save it
                await upsertCustomerSubscription(supabaseClient, accountId, data);
            }

            return new Response(JSON.stringify({message: "Webhook processed"}), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        } catch (e) {
            return new Response(
                JSON.stringify({error: "Error processing webhook"}),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }
    };
}
