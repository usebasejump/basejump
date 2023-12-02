import {expect} from "@playwright/test";
import {NEW_SUBSCRIPTION_CANCEL_URL, NEW_SUBSCRIPTION_SUCCESS_URL} from "./variables.ts";

export default async function getVerifiedNewSubscriptionUrl(supabaseClient, accountId, planId = null) {
    const {data} = await supabaseClient.functions.invoke('billing-functions', {
        body: {
            action: "get_new_subscription_url",
            args: {
                account_id: accountId,
                plan_id: planId,
                success_url: NEW_SUBSCRIPTION_SUCCESS_URL,
                cancel_url: NEW_SUBSCRIPTION_CANCEL_URL,
            }
        }
    });

    expect(data.billing_enabled).toEqual(true);
    expect(data.url).not.toBeNull();

    return data;
}