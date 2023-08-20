import { SupabaseClient } from "@supabase/supabase-js";
import { GET_ACCOUNT_MEMBERS_RESPONSE } from "@usebasejump/shared";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type Props = {
  accountId: string;
  supabaseClient: SupabaseClient<any> | null;
  options?: UseQueryOptions;
};

export const useAccountMembers = ({
  supabaseClient,
  accountId,
  options,
}: Props) => {
  return useQuery<GET_ACCOUNT_MEMBERS_RESPONSE>({
    queryKey: ["account-members", accountId],
    queryFn: async () => {
      const { data, error } = await supabaseClient.rpc("get_account_members", {
        account_id: accountId,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!supabaseClient && !!accountId,
    ...options,
  });
};
