import {SupabaseClient} from "@supabase/supabase-js";
import {useApiRequest} from "./use-api-request";
import {GET_ACCOUNT_RESPONSE} from "@usebasejump/shared";

type Props = {
    accountId?: string;
    accountSlug?: string;
    supabaseClient?: SupabaseClient<any> | null;
}

export const useAccount = ({supabaseClient, accountId, accountSlug}: Props) => {
    return useApiRequest<GET_ACCOUNT_RESPONSE>({supabaseClient, apiRequest: async () => {
            if (!supabaseClient) {
                throw new Error('Client not yet loaded');
            };

            if (!accountId && !accountSlug) {
                throw new Error('Account ID or slug required');
            }

            if (accountId) {
                const response = await supabaseClient.rpc('get_account', {account_id: accountId});

                return response;
            }

            const response = await supabaseClient.rpc('get_account_by_slug', {slug: accountSlug});
            return response;
        }})
}