import {SupabaseClient} from "@supabase/supabase-js";
import {useApiRequest} from "./use-api-request";
import {GET_ACCOUNTS_RESPONSE} from "@usebasejump/shared";

type Props = {
    supabaseClient?: SupabaseClient<any> | null;
}

export const useAccounts = ({supabaseClient}: Props) => {
    return useApiRequest<GET_ACCOUNTS_RESPONSE>({supabaseClient, apiRequest: async () => {
        if (!supabaseClient) {
            throw new Error('Client not yet loaded');
        };
        const response = await supabaseClient.rpc('get_accounts');
        return response;
    }})
}