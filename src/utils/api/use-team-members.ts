import { useSessionContext, useUser } from "@supabase/auth-helpers-react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import handleSupabaseErrors from "../handle-supabase-errors";
import { Database } from "@/types/supabase-types";

export type UseTeamMembersResponse = {
  user_id: string;
  account_id: string;
  is_primary_owner: boolean;
  account_role: Database["public"]["Tables"]["account_user"]["Row"]["account_role"];
  name: string;
};

export default function useTeamMembers(
  accountId: string,
  options?: UseQueryOptions<UseTeamMembersResponse[]>
) {
  const user = useUser();
  const { supabaseClient } = useSessionContext();
  return useQuery<UseTeamMembersResponse[], Error>(
    ["teamMembers", accountId],
    async () => {
      const { data, error } = await supabaseClient
        .from("account_user")
        .select("*, profiles(name), accounts(primary_owner_user_id)")
        .match({ account_id: accountId });
      handleSupabaseErrors(data, error);

      return data?.map(({ account_role, user_id, profiles, accounts }) => ({
        account_role,
        account_id: accountId,
        name: profiles.name,
        is_primary_owner: accounts.primary_owner_user_id === user_id,
        user_id,
      }));
    },
    {
      ...options,
      enabled: !!accountId && !!user && !!supabaseClient,
    }
  );
}
