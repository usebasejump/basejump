import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import handleSupabaseErrors from "../handle-supabase-errors";
import { Database } from "@/types/supabase-types";

export type UseTeamRoleResponse = {
  is_primary_owner: boolean;
  account_role: Database["public"]["Tables"]["account_user"]["Row"]["account_role"];
};

/**
 * Get the current user's role in a team
 * @param accountId
 * @param options
 */
export default function useTeamRole(
  accountId: string,
  options?: UseQueryOptions<UseTeamRoleResponse>
) {
  const user = useUser();
  const supabaseClient = useSupabaseClient<Database>();
  const { data, isLoading } = useQuery(
    ["teamRole", accountId],
    async () => {
      const { data, error } = await supabaseClient
        .rpc("current_user_account_role", {
          lookup_account_id: accountId,
        })
        .single();
      handleSupabaseErrors(data, error);

      return data;
    },
    {
      ...options,
      enabled: !!accountId && !!user && !!supabaseClient,
    }
  );

  return {
    accountRole: data?.account_role,
    isPrimaryOwner: data?.is_primary_owner,
    isLoading,
  };
}
