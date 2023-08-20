import { SupabaseClient } from "@supabase/supabase-js";
import { GET_ACCOUNT_INVITES_RESPONSE } from "@usebasejump/shared";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type Props = {
  accountId: string;
  supabaseClient: SupabaseClient<any> | null;
  options?: UseQueryOptions;
};

export const useAccountInvitations = ({
  supabaseClient,
  accountId,
  options,
}: Props) => {
  return useQuery<GET_ACCOUNT_INVITES_RESPONSE>({
    queryKey: ["account-invitations", accountId],
    queryFn: async () => {
      const { data, error } = await supabaseClient.rpc(
        "get_account_invitations",
        {
          account_id: accountId,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!supabaseClient && !!accountId,
    ...options,
  });
};
