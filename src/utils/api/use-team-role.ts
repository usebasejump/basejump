import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import handleSupabaseErrors from "../handle-supabase-errors";
import { definitions } from "@/types/supabase-generated";

export type UseTeamRoleResponse = {
  is_primary_owner: boolean;
  account_role: definitions["account_user"]["account_role"];
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
  const { user } = useUser();
  const { data, isLoading } = useQuery<UseTeamRoleResponse, Error>(
    ["teamRole", accountId],
    async () => {
      const { data, error } = await supabaseClient
        .rpc<UseTeamRoleResponse>("current_user_account_role", {
          lookup_account_id: accountId,
        })
        .single();
      handleSupabaseErrors(data, error);

      return data;
    },
    {
      ...options,
      enabled: !!accountId && !!user,
    }
  );

  return {
    accountRole: data?.account_role,
    isPrimaryOwner: data?.is_primary_owner,
    isLoading,
  };
}
