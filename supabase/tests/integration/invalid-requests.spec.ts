import {expect, test} from '@playwright/test';
import testInvalidNewSubscriptionUrl from "./utils/test-invalid-new-subscription-url.ts";
import testInvalidBillingPortalUrl from "./utils/test-invalid-billing-portal-url.ts";
import testMissingAccountId from "./utils/test-missing-account-id.ts";
import setupBasejumpAccount from "./utils/setup-basejump-account.ts";
import testUnauthorized from "./utils/test-unauthorized.ts";

const timestamp = Date.now();
const uniqueIdentifier = `invalid-requests-${timestamp}`;

test('Shouldnt be able to make things up or pass bad data', async ({page}) => {
    const {accountId, supabaseClient} = await setupBasejumpAccount(uniqueIdentifier);


    /***
     * Initialize a subscription with the default plan and trial days (ENV var configured)
     */

    await testInvalidNewSubscriptionUrl(supabaseClient, accountId);

    /***
     * Get billing portal without a valid return URL
     */

    await testInvalidBillingPortalUrl(supabaseClient, accountId);


    /***
     * Hit all endpoints without an account ID
     */

    await testMissingAccountId(supabaseClient);


    /***
     * Hit an invalid endpoint action
     */

    const {error} = await supabaseClient.functions.invoke('test-stripe-billing-functions', {
        body: {
            action: 'not_a_thing',
            args: {
                account_id: "account_id_here"
            }
        }
    });

    const invalidUrlError = await error.context.json();

    expect(invalidUrlError.error).toEqual('Invalid action');

    /**
     * Unauthorized requests
     */

    const {supabaseClient: unauthorizedClient} = await setupBasejumpAccount(`unauthorized-access-${timestamp}`);

    await testUnauthorized(unauthorizedClient, accountId);
});