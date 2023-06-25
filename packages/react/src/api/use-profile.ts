import {SupabaseClient} from "@supabase/supabase-js";
import {useApiRequest} from "./use-api-request";
import {GET_PROFILE_RESPONSE} from "@usebasejump/shared";

type Props = {
    supabaseClient?: SupabaseClient<any> | null;
}

export const useProfile = ({supabaseClient}: Props) => {
    return useApiRequest<GET_PROFILE_RESPONSE>({supabaseClient, apiRequest: async () => {
            if (!supabaseClient) {
                throw new Error('Client not yet loaded');
            };
            const response = await supabaseClient.rpc('get_profile');
            return response;
        }})
}