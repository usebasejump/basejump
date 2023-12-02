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

export async function fillInStripeCard(page, cardType: 'valid' | 'invalid' | 'declined' = 'valid') {
    await page.getByPlaceholder('1234 1234 1234').fill(stripeCards[cardType].number);
    await page.getByPlaceholder('MM / YY').fill(stripeCards[cardType].expiry);
    await page.getByPlaceholder('CVC').fill(stripeCards[cardType].cvc);
    await page.getByPlaceholder('Full name on card').fill(stripeCards[cardType].name);
    await page.getByPlaceholder('ZIP').fill(stripeCards[cardType].zip);
    await page.getByTestId('hosted-payment-submit-button').click();
}

export async function updatePaymentBillingPortal(page, cardType: 'valid' | 'invalid' | 'declined' = 'valid') {
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

export async function cancelStripeCheckout(page) {
    await page.getByLabel('Back to Basejump').click();
}

export async function removeSubscriptionTrial(stripeClient, subscriptionId) {
    const subscription = await stripeClient.subscriptions.update(subscriptionId, {
        trial_end: 'now',
    });
    return subscription;
}

export async function cancelSubscription(stripeClient, subscriptionId) {
    const subscription = await stripeClient.subscriptions.cancel(subscriptionId);
    return subscription;
}