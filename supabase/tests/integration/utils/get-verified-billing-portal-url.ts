import {expect} from "@playwright/test";

export default async function getVerifiedBillingPortalUrl(supabaseClient, accountId) {
    const {data, error} = await supabaseClient.functions.invoke('billing-functions', {
        body: {
            action: "get_billing_portal_url",
            args: {
                account_id: accountId,
                return_url: 'http://127.0.0.1:54323/return',
            }
        }
    });
    
    expect(data.billing_enabled).toEqual(true);
    expect(data.url).not.toBeNull();

    return data;
}