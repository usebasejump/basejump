import {expect} from "@playwright/test";
import {BILLING_PORTAL_RETURN_URL} from "./variables.ts";

export default async function getVerifiedBillingPortalUrl(supabaseClient, accountId) {
    const {data, error} = await supabaseClient.functions.invoke('billing-functions', {
        body: {
            action: "get_billing_portal_url",
            args: {
                account_id: accountId,
                return_url: BILLING_PORTAL_RETURN_URL,
            }
        }
    });

    expect(data.billing_enabled).toEqual(true);
    expect(data.url).not.toBeNull();

    return data;
}