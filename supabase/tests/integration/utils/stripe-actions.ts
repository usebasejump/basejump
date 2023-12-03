import {BILLING_PORTAL_RETURN_URL, NEW_SUBSCRIPTION_CANCEL_URL, NEW_SUBSCRIPTION_SUCCESS_URL} from "./variables.ts";

const stripeCards = {
    valid: {
        number: '4242 4242 4242 4242',
        expiry: '04 / 24',
        cvc: '424',
        name: 'Tester',
        zip: '777777',
    },
    invalid: {
        number: '4000 0000 0000 0002',
        expiry: '04 / 24',
        cvc: '424',
        name: 'Tester',
        zip: '777777',
    },
    declined: {
        number: '4000 0000 0000 0341',
        expiry: '04 / 24',
        cvc: '424',
        name: 'Tester',
        zip: '777777',
    }
}

/**
 * For a given page, fill in stripe card details on a payment form using Playwright
 * @param page
 * @param cardType
 */
export async function playwrightFillInStripeCard(page, cardType: 'valid' | 'invalid' | 'declined' = 'valid') {
    await page.getByPlaceholder('1234 1234 1234').fill(stripeCards[cardType].number);
    await page.getByPlaceholder('MM / YY').fill(stripeCards[cardType].expiry);
    await page.getByPlaceholder('CVC').fill(stripeCards[cardType].cvc);
    await page.getByPlaceholder('Full name on card').fill(stripeCards[cardType].name);
    await page.getByPlaceholder('ZIP').fill(stripeCards[cardType].zip);
    await page.getByTestId('hosted-payment-submit-button').click();
}

/**
 * For a given page, update a card on the stripe billing portal using Playwright
 * @param page
 * @param cardType
 */
export async function playwrightUpdatePaymentBillingPortal(page, cardType: 'valid' | 'invalid' | 'declined' = 'valid') {
    await page.locator('[data-test="pay-subscription-open-invoice"]').click();
    await page.getByText('Add payment method').click();
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').first().getByPlaceholder('1234 1234 1234').click();
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').first().getByPlaceholder('1234 1234 1234').fill(stripeCards[cardType].number);
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').first().getByPlaceholder('MM / YY').fill(stripeCards[cardType].expiry);
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').first().getByPlaceholder('CVC').fill(stripeCards[cardType].cvc);
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').first().getByPlaceholder('12345').fill(stripeCards[cardType].zip);
    await page.getByTestId('confirm').click();
    // wait for the words Invoice History to show on the page
    await page.waitForSelector('text=Invoice History');
    await page.getByRole('link', {name: 'Basejump Test mode'}).click();
}

/**
 * For a given page on the stripe checkoug, cancel and go back to Basejump cancel URL
 * @param page
 */
export async function playwrightCancelStripeCheckout(page) {
    await page.getByLabel('Back to Basejump').click();
}

/**
 * Cancel the trial on a stripe account directly in stripe
 * @param stripeClient
 * @param subscriptionId
 */
export async function removeStripeSubscriptionTrial(stripeClient, subscriptionId) {
    const subscription = await stripeClient.subscriptions.update(subscriptionId, {
        trial_end: 'now',
    });
    return subscription;
}

/**
 * Cancel a subscription on a stripe account directly in stripe
 * @param stripeClient
 * @param subscriptionId
 */
export async function cancelStripeSubscription(stripeClient, subscriptionId) {
    const subscription = await stripeClient.subscriptions.cancel(subscriptionId);
    return subscription;
}

/**
 * Create a new customer directly in Stripe and return the customer ID
 * @param stripeClient
 * @param email
 * @param basejumpAccountId
 */
export async function createStripeCustomer(stripeClient, email, basejumpAccountId) {
    const customer = await stripeClient.customers.create({
        email,
        metadata: {
            basejump_account_id: basejumpAccountId,
        },
    });

    return customer.id;
}

/**
 * Create a new subscription checkout session directly in Stripe and return the URL to it
 * @param stripeClient
 * @param accountId
 * @param planId
 * @param trialDays
 */
export async function newStripeSubscriptionUrl(stripeClient, customerId, basejumpAccountId, planId, trialDays = 7) {
    const trialEnd = Math.floor(Date.now() / 1000) + (trialDays * 24 * 60 * 60);
    const session = await stripeClient.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        subscription_data: {
            trial_end: trialEnd,
            trial_settings: {
                end_behavior: {
                    missing_payment_method: 'create_invoice' // subscription will go past_due if no payment method is added in time
                }
            },
            metadata: {
                basejump_account_id: basejumpAccountId,
            },
            items: [
                {
                    plan: planId
                },
            ],
        },
        mode: "subscription",
        success_url: NEW_SUBSCRIPTION_SUCCESS_URL,
        cancel_url: NEW_SUBSCRIPTION_CANCEL_URL,
        metadata: {
            basejump_account_id: basejumpAccountId,
        },
    });
    return session.url;
}

/**
 * Create a new billing portal session directly in Stripe and return the URL to it
 * @param stripeClient
 * @param customerId
 */
export async function stripeBillingPortalUrl(stripeClient, customerId) {
    const session = await stripeClient.billingPortal.sessions.create({
        customer: customerId,
        return_url: BILLING_PORTAL_RETURN_URL,
    });
    return session.url;
}