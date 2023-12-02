import {expect} from "@playwright/test";

export default async function testInvalidBillingPortalUrl(supabaseClient, accountId) {

    const payloads = [
        {
            account_id: accountId,
            return_url: 'http://invalid:3000',
        },
        {
            account_id: accountId
        }
    ]

    for (const payload of payloads) {
        const {error} = await supabaseClient.functions.invoke('billing-functions', {
            body: {
                action: "get_billing_portal_url",
                args: payload
            }
        });

        const invalidUrlError = await error.context.json()

        expect(invalidUrlError.error).toEqual('Return url is not allowed');
    }

}