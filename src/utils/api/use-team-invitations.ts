import { useSessionContext, useUser } from "@supabase/auth-helpers-react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import handleSupabaseErrors from "../handle-supabase-errors";
import { Database } from "@/types/supabase-types";

export default function useTeamInvitations(
  accountId: string,
  options?: UseQueryOptions<
    Database["public"]["Tables"]["invitations"]["Row"][]
  >
) {
  const user = useUser();
  const { supabaseClient } = useSessionContext();
  return useQuery<Database["public"]["Tables"]["invitations"]["Row"][], Error>(
    ["teamInvitations", accountId],
    async () => {
      const { data, error } = await supabaseClient
        .from("invitations")
        .select("*")
        .order("created_at", { ascending: false })
        .match({ account_id: accountId });
      handleSupabaseErrors(data, error);

      return data;
    },
    {
      ...options,
      enabled: !!accountId && !!user && !!supabaseClient,
    }
  );
}
