import {expect} from "@playwright/test";

export default async function testInvalidNewSubscriptionUrl(supabaseClient, accountId) {

    const payloads = [
        {
            account_id: accountId,
            success_url: 'http://invalid:3000',
            cancel_url: 'http://127.0.0.1:54323',
        },
        {
            account_id: accountId,
            success_url: 'http://127.0.0.1:54323',
            cancel_url: 'http://invalid:3000',
        },
        {
            account_id: accountId,
            cancel_url: 'http://127.0.0.1:54323',
        },
        {
            account_id: accountId,
            success_url: 'http://127.0.0.1:54323',
        }
    ]

    for (const payload of payloads) {
        const {error} = await supabaseClient.functions.invoke('test-stripe-billing-functions', {
            body: {
                action: "get_new_subscription_url",
                args: payload
            }
        });

        const invalidUrlError = await error.context.json()

        expect(invalidUrlError.error).toEqual('Success or cancel url is not allowed');
    }

}