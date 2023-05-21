import { useSessionContext, useUser } from "@supabase/auth-helpers-react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import handleSupabaseErrors from "../handle-supabase-errors";
import { Database } from "@/types/supabase-types";

type TeamAccountWithRole = Database["public"]["Tables"]["accounts"]["Row"] & {
  account_role: string;
};

export default function useTeamAccounts(
  options?: UseQueryOptions<TeamAccountWithRole[]>
) {
  const user = useUser();
  const { supabaseClient } = useSessionContext();
  return useQuery<TeamAccountWithRole[], Error>(
    ["teamAccounts", user?.id],
    async () => {
      const { data, error } = await supabaseClient
        .from("account_user")
        .select("account_role, account:account_id (*)")
        .eq("user_id", user?.id)
        .eq("account.personal_account", false);
      handleSupabaseErrors(data, error);

      return data?.map(({ account_role, account }) => ({
        ...account,
        account_role,
      }));
    },
    {
      ...options,
      enabled: !!user && !!supabaseClient,
    }
  );
}
