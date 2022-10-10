import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import handleSupabaseErrors from "../handle-supabase-errors";
import { definitions } from "@/types/supabase-generated";

export default function useTeamAccount(
  accountId: string,
  options?: UseQueryOptions<definitions["accounts"]>
) {
  return useQuery<definitions["accounts"], Error>(
    ["teamAccount", accountId],
    async () => {
      const { data, error } = await supabaseClient
        .from("accounts")
        .select()
        .eq("id", accountId)
        .single();
      handleSupabaseErrors(data, error);
      return data;
    },
    {
      ...options,
      enabled: !!accountId,
    }
  );
}
