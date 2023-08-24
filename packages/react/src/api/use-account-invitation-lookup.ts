import { SupabaseClient } from "@supabase/supabase-js";
import { LOOKUP_INVITATION_RESPONSE } from "@usebasejump/shared";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type Props = {
  token: string;
  supabaseClient: SupabaseClient<any> | null;
  options?: UseQueryOptions;
};

export const useAccountInvitationLookup = ({
  supabaseClient,
  token,
  options,
}: Props) => {
  return useQuery<LOOKUP_INVITATION_RESPONSE>({
    queryKey: ["account-invitation-lookup", token],
    queryFn: async () => {
      const { data, error } = await supabaseClient.rpc("lookup_invitation", {
        lookup_invitation_token: token,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!supabaseClient && !!token,
    ...options,
  });
};
