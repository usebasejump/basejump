import {expect, test} from '@playwright/test';
import {createClient} from "@supabase/supabase-js";
import testInvalidNewSubscriptionUrl from "./utils/test-invalid-new-subscription-url.ts";
import testInvalidBillingPortalUrl from "./utils/test-invalid-billing-portal-url.ts";
import testMissingAccountId from "./utils/test-missing-account-id.ts";

const timestamp = Date.now();
const supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const accountSlug = `stripe-test-account-${timestamp}-2`;

test('Shouldnt be able to make things up or pass bad data', async ({page}) => {
    const {data: {session}} = await supabaseClient.auth.signUp({
        email: `test+${timestamp}-2@test.com`,
        password: 'test1234',
    });
    expect(session.access_token).not.toBeNull();

    const {data: account} = await supabaseClient.rpc('create_account', {
        slug: accountSlug,
        name: 'Test Account',
    });

    expect(account.slug).toEqual(accountSlug);

    const accountId = account.account_id;


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

    const {error} = await supabaseClient.functions.invoke('billing-functions', {
        body: {
            action: 'not_a_thing',
            args: {
                account_id: "account_id_here"
            }
        }
    });

    const invalidUrlError = await error.context.json();

    expect(invalidUrlError.error).toEqual('Invalid action');

});