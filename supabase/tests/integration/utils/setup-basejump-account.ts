import {expect} from "@playwright/test";
import {createClient, SupabaseClient} from "@supabase/supabase-js";

export default async function setupBasejumpAccount(uniqueIdentifier: string): {
    supabaseClient: SupabaseClient,
    accountId: string,
    billingEmail: string,
} {
    const supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const billingEmail = `test+${uniqueIdentifier}@test.com`;

    const {data: {session}} = await supabaseClient.auth.signUp({
        email: billingEmail,
        password: 'test1234',
    });

    expect(session.access_token).not.toBeNull();

    const {data: account} = await supabaseClient.rpc('create_account', {
        slug: uniqueIdentifier,
        name: uniqueIdentifier
    });

    expect(account.slug).toEqual(uniqueIdentifier);

    const accountId = account.account_id;

    return {supabaseClient, accountId, billingEmail};
}