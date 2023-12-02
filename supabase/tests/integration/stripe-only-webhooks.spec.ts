import {test} from '@playwright/test';
import setupBasejumpAccount from "./utils/setup-basejump-account.ts";

const timestamp = Date.now();
const uniqueIdentifier = `stripe-only-webhooks-${timestamp}`;

test('Should be able to perform full user journey using only webhook updates from Stripe', async ({page}) => {
    /**
     * Repeat full stripe flow, but ONLY by interacting with Stripe directly and then querying Supabase for the results
     * after the webhook has hit
     */

        //TODO: Move to using this in all tests
    const {accountId, supabaseClient} = await setupBasejumpAccount(uniqueIdentifier);

});