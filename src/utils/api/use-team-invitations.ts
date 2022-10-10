import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import handleSupabaseErrors from "../handle-supabase-errors";
import { definitions } from "@/types/supabase-generated";

export default function useTeamInvitations(
  accountId: string,
  options?: UseQueryOptions<definitions["invitations"][]>
) {
  const { user } = useUser();
  return useQuery<definitions["invitations"][], Error>(
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
      enabled: !!accountId && !!user,
    }
  );
}
