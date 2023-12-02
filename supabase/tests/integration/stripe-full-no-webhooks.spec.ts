import {expect, test} from '@playwright/test';
import {createClient} from "@supabase/supabase-js";
import getVerifiedNewSubscriptionUrl from "./utils/get-verified-new-subscription-url.ts";
import getVerifiedAccountStatus from "./utils/get-verified-account-status.ts";
import {
    cancelStripeCheckout,
    cancelSubscription,
    fillInStripeCard,
    removeSubscriptionTrial,
    updatePaymentBillingPortal
} from "./utils/stripe-actions.ts";
import Stripe from 'stripe';
import getVerifiedBillingPortalUrl from "./utils/get-verified-billing-portal-url.ts";

const timestamp = Date.now();
const supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const accountSlug = `stripe-test-account-${timestamp}`;
const stripeClient = new Stripe(process.env.STRIPE_API_KEY);

test('Should be able to sign up, register for a trial, convert to an account, fail next payment and be deactivated, then fix', async ({page}) => {
    const {data: {session}, error} = await supabaseClient.auth.signUp({
        email: `test+${timestamp}@test.com`,
        password: 'test1234',
    });

    expect(error).toBeNull();
    expect(session.access_token).not.toBeNull();

    const {data: account} = await supabaseClient.rpc('create_account', {
        slug: accountSlug,
        name: 'Test Account',
    });

    expect(account.slug).toEqual(accountSlug);

    const accountId = account.account_id;

    /***
     * Get billing status and make sure we're not active
     */
    await getVerifiedAccountStatus(supabaseClient, accountId, {
        subscriptionActive: false,
        billingEnabled: true,
        subscriptionStatus: "not_setup"
    });

    /***
     * Check available plans
     */
    const {data: plans} = await supabaseClient.functions.invoke('billing-functions', {
        body: {
            action: 'get_plans',
            args: {
                account_id: accountId
            }
        }
    });

    expect(plans.length).toBeGreaterThan(0);

    /***
     * Initialize a subscription with the default plan and trial days (ENV var configured)
     */

    const newSubscriptionData = await getVerifiedNewSubscriptionUrl(supabaseClient, accountId);

    // go to stripe url and complete checkout
    await page.goto(newSubscriptionData.url);

    await cancelStripeCheckout(page);

    await page.waitForURL('http://127.0.0.1:54323/cancel', {timeout: 10000});

    expect(page.url()).toEqual('http://127.0.0.1:54323/cancel');

    await page.goto(newSubscriptionData.url);

    await fillInStripeCard(page, 'declined');

    await page.waitForURL('http://127.0.0.1:54323/success', {timeout: 10000});

    expect(page.url()).toEqual('http://127.0.0.1:54323/success');

    /***
     * Verify subscription is now active and in trial state
     */



    const trialData = await getVerifiedAccountStatus(supabaseClient, accountId, {
        subscriptionActive: true,
        billingEnabled: true,
        subscriptionStatus: "trialing"
    });

    /***
     * Convert trial to plan, will fail since bad card
     */

    await removeSubscriptionTrial(stripeClient, trialData.subscription_id);

    await getVerifiedAccountStatus(supabaseClient, accountId, {
        subscriptionActive: false,
        billingEnabled: true,
        subscriptionStatus: "past_due"
    });


    /***
     * Generate stripe URL to collect payment method
     */

    const billingPortal = await getVerifiedBillingPortalUrl(supabaseClient, accountId);

    await page.goto(billingPortal.url);
    await updatePaymentBillingPortal(page, 'valid');

    await page.waitForURL('http://127.0.0.1:54323/return', {timeout: 10000});

    expect(page.url()).toEqual('http://127.0.0.1:54323/return');


    /***
     * Verify subscription is now active
     */

    // delay to allow stripe to process payments
    await getVerifiedAccountStatus(supabaseClient, accountId, {
        subscriptionActive: true,
        billingEnabled: true,
        subscriptionStatus: "active"
    });

    /***
     * Cancel subscription
     */

    await cancelSubscription(stripeClient, trialData.subscription_id);

    await getVerifiedAccountStatus(supabaseClient, accountId, {
        subscriptionActive: false,
        billingEnabled: true,
        subscriptionStatus: "canceled"
    });
});