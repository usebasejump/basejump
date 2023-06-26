import { SupabaseClient } from "@supabase/supabase-js";
import { useApiRequest } from "./use-api-request";
import { GET_ACCOUNT_INVITES_RESPONSE } from "@usebasejump/shared";

type Props = {
  accountId?: string;
  accountSlug?: string;
  supabaseClient?: SupabaseClient<any> | null;
};

export const useAccountInvitations = ({ supabaseClient, accountId }: Props) => {
  return useApiRequest<GET_ACCOUNT_INVITES_RESPONSE>({
    supabaseClient,
    apiRequest: async () => {
      if (!supabaseClient) {
        throw new Error("Client not yet loaded");
      }
      if (!accountId) {
        throw new Error("Account ID required");
      }

      const response = await supabaseClient.rpc("get_account_members", {
        account_id: accountId,
      });

      return response;
    },
  });
};
