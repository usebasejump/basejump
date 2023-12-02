import {expect, test} from '@playwright/test';
import setupBasejumpAccount from "./utils/setup-basejump-account.ts";
import {
    cancelStripeSubscription,
    createStripeCustomer,
    newStripeSubscriptionUrl,
    playwrightFillInStripeCard,
    playwrightUpdatePaymentBillingPortal,
    removeStripeSubscriptionTrial,
    stripeBillingPortalUrl
} from "./utils/stripe-actions.ts";
import Stripe from "stripe";

const timestamp = Date.now();
const uniqueIdentifier = `stripe-only-webhooks-${timestamp}`
const stripeClient = new Stripe(process.env.STRIPE_API_KEY);

const stripeDefaultPlanId = process.env.STRIPE_DEFAULT_PLAN_ID;

test('Should be able to perform full user journey using only webhook updates from Stripe', async ({page}) => {
    /**
     * Repeat full stripe flow, but ONLY by interacting with Stripe directly and then querying Supabase for the results
     * after the webhook has hit
     */

    const {accountId, supabaseClient, billingEmail} = await setupBasejumpAccount(uniqueIdentifier);

    /**
     * Create a new Stripe customer
     */

    const customerId = await createStripeCustomer(stripeClient, billingEmail, accountId);
    await expect.poll(async () => {
        const {data} = await supabaseClient.rpc('get_account_billing_status', {account_id: accountId});
        return data.billing_customer_id;
    }, {
        // Custom error message, optional.
        message: 'customer ID should be returned', // custom error message
        // Poll for 10 seconds; defaults to 5 seconds. Pass 0 to disable timeout.
        timeout: 10000,
    }).toEqual(customerId);

    /**
     * Create a new stripe subscription, complete it, and make sure we get back the trial
     */

    const subscriptionUrl = await newStripeSubscriptionUrl(stripeClient, customerId, accountId, stripeDefaultPlanId);

    await page.goto(subscriptionUrl);

    await playwrightFillInStripeCard(page, 'declined');

    await expect.poll(async () => {
        const {data} = await supabaseClient.rpc('get_account_billing_status', {account_id: accountId});
        return data.billing_status;
    }, {
        // Custom error message, optional.
        message: 'Account should be trialing', // custom error message
        // Poll for 10 seconds; defaults to 5 seconds. Pass 0 to disable timeout.
        timeout: 10000,
    }).toEqual('trialing');


    const {data: trialingData} = await supabaseClient.rpc('get_account_billing_status', {account_id: accountId});
    const subscriptionId = trialingData.billing_subscription_id;

    expect(trialingData.billing_subscription_id).not.toBeNull();
    expect(trialingData.billing_provider).toEqual('stripe');
    expect(trialingData.billing_email).toEqual(billingEmail);

    /**
     * Cancel trial, should go past_due
     */

    await removeStripeSubscriptionTrial(stripeClient, subscriptionId);

    await expect.poll(async () => {
        const {data} = await supabaseClient.rpc('get_account_billing_status', {account_id: accountId});
        return data.billing_status;
    }, {
        // Custom error message, optional.
        message: 'Account should be delinquent after first payment', // custom error message
        // Poll for 10 seconds; defaults to 5 seconds. Pass 0 to disable timeout.
        timeout: 10000,
    }).toEqual('past_due');

    /**
     * Fix subscription through billing portal URL
     */

    const billingPortalUrl = await stripeBillingPortalUrl(stripeClient, customerId);

    await page.goto(billingPortalUrl);

    await playwrightUpdatePaymentBillingPortal(page, 'valid');

    await expect.poll(async () => {
        const {data} = await supabaseClient.rpc('get_account_billing_status', {account_id: accountId});
        return data.billing_status;
    }, {
        // Custom error message, optional.
        message: 'Account should be active after fixing', // custom error message
        // Poll for 10 seconds; defaults to 5 seconds. Pass 0 to disable timeout.
        timeout: 10000,
    }).toEqual('active');

    await cancelStripeSubscription(stripeClient, subscriptionId);

    await expect.poll(async () => {
        const {data} = await supabaseClient.rpc('get_account_billing_status', {account_id: accountId});
        return data.billing_status;
    }, {
        // Custom error message, optional.
        message: 'Account should be canceled after customer cancels', // custom error message
        // Poll for 10 seconds; defaults to 5 seconds. Pass 0 to disable timeout.
        timeout: 10000,
    }).toEqual('canceled');
});