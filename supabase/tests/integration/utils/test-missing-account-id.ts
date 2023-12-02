import {expect} from "@playwright/test";

export default async function testMissingAccountId(supabaseClient) {
    const actions = [
        "get_new_subscription_url",
        "get_billing_status",
        "get_billing_portal_url",
    ];

    for (const action of actions) {
        const {error} = await supabaseClient.functions.invoke('billing-functions', {
            body: {
                action,
                args: {}
            }
        });

        const invalidUrlError = await error.context.json();

        expect(invalidUrlError.error).toEqual('Account id is required');
    }
}