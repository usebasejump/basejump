import {expect, test} from '@playwright/test';
import getVerifiedNewSubscriptionUrl from "./utils/get-verified-new-subscription-url.ts";
import getVerifiedAccountStatus from "./utils/get-verified-account-status.ts";
import {
    cancelStripeCheckout,
    cancelSubscription,
    fillInStripeCard,
    removeSubscriptionTrial,
    updatePaymentBillingPortal
} from "./utils/stripe-actions.ts";
import getVerifiedBillingPortalUrl from "./utils/get-verified-billing-portal-url.ts";
import {
    BILLING_PORTAL_RETURN_URL,
    NEW_SUBSCRIPTION_CANCEL_URL,
    NEW_SUBSCRIPTION_SUCCESS_URL
} from "./utils/variables.ts";
import setupBasejumpAccount from "./utils/setup-basejump-account.ts";
import Stripe from "stripe";

const timestamp = Date.now();
const uniqueIdentifier = `stripe-no-webhooks-${timestamp}`
const stripeClient = new Stripe(process.env.STRIPE_API_KEY);

test('Should be able to sign up, register for a trial, convert to an account, fail next payment and be deactivated, then fix', async ({page}) => {
    const {accountId, supabaseClient} = await setupBasejumpAccount(uniqueIdentifier);

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

    await page.waitForURL(NEW_SUBSCRIPTION_CANCEL_URL, {timeout: 10000});

    expect(page.url()).toEqual(NEW_SUBSCRIPTION_CANCEL_URL);

    await page.goto(newSubscriptionData.url);

    await fillInStripeCard(page, 'declined');

    await page.waitForURL(NEW_SUBSCRIPTION_SUCCESS_URL, {timeout: 10000});

    expect(page.url()).toEqual(NEW_SUBSCRIPTION_SUCCESS_URL);

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

    await page.waitForURL(BILLING_PORTAL_RETURN_URL, {timeout: 10000});

    expect(page.url()).toEqual(BILLING_PORTAL_RETURN_URL);


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