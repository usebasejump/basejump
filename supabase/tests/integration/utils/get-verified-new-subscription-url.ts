import {expect} from "@playwright/test";

export default async function getVerifiedNewSubscriptionUrl(supabaseClient, accountId, planId = null) {
    const {data} = await supabaseClient.functions.invoke('billing-functions', {
        body: {
            action: "get_new_subscription_url",
            args: {
                account_id: accountId,
                plan_id: planId,
                success_url: 'http://127.0.0.1:54323/success',
                cancel_url: 'http://127.0.0.1:54323/cancel',
            }
        }
    });

    expect(data.billing_enabled).toEqual(true);
    expect(data.url).not.toBeNull();

    return data;
}