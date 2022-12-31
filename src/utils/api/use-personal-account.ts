import { useSessionContext, useUser } from "@supabase/auth-helpers-react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import handleSupabaseErrors from "../handle-supabase-errors";
import { Database } from "@/types/supabase-types";

export default function usePersonalAccount(
  options?: UseQueryOptions<Database["public"]["Tables"]["accounts"]["Row"]>
) {
  const user = useUser();
  const { supabaseClient } = useSessionContext();
  return useQuery<Database["public"]["Tables"]["accounts"]["Row"], Error>(
    ["personalAccount", user?.id],
    async () => {
      const { data, error } = await supabaseClient
        .from("accounts")
        .select()
        .eq("primary_owner_user_id", user?.id)
        .eq("personal_account", true)
        .maybeSingle();
      handleSupabaseErrors(data, error);
      return data;
    },
    {
      ...options,
      enabled: !!user && !!supabaseClient,
    }
  );
}
