import {expect} from "@playwright/test";

export default async function getVerifiedAccountStatus(supabaseClient, accountId, {
    subscriptionActive = false,
    billingEnabled = true,
    subscriptionStatus = 'trialing'
}) {
    const {data} = await supabaseClient.functions.invoke('test-stripe-billing-functions', {
        body: {
            action: 'get_billing_status',
            args: {
                account_id: accountId
            }
        }
    });

    expect(data.subscription_active).toEqual(subscriptionActive);
    expect(data.billing_enabled).toEqual(billingEnabled);
    expect(data.status).toEqual(subscriptionStatus);

    return data;
}