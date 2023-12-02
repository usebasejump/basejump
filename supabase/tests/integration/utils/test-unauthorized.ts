import {expect} from "@playwright/test";
import {BILLING_PORTAL_RETURN_URL, NEW_SUBSCRIPTION_CANCEL_URL, NEW_SUBSCRIPTION_SUCCESS_URL} from "./variables.ts";

export default async function testUnauthorized(unauthorizedClient, accountId) {

    const payloads = [
        {
            action: 'get_billing_portal_url',
            args: {
                account_id: accountId,
                return_url: BILLING_PORTAL_RETURN_URL
            }
        },
        {
            action: 'get_new_subscription_url',
            args: {
                account_id: accountId,
                success_url: NEW_SUBSCRIPTION_SUCCESS_URL,
                cancel_url: NEW_SUBSCRIPTION_CANCEL_URL
            }
        },
        {
            action: 'get_billing_status',
            args: {
                account_id: accountId
            }
        }
    ];

    for (const payload of payloads) {
        const {error} = await unauthorizedClient.functions.invoke('test-stripe-billing-functions', {
            body: payload
        });

        const invalidUrlError = await error.context.json()

        expect(error.context.status).toEqual(401);
        expect(invalidUrlError.error).toEqual('Unauthorized');
    }

}