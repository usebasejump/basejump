import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import handleSupabaseErrors from "../handle-supabase-errors";
import { definitions } from "@/types/supabase-generated";

export default function usePersonalAccount(
  options?: UseQueryOptions<definitions["accounts"]>
) {
  const { user } = useUser();
  return useQuery<definitions["accounts"], Error>(
    ["personalAccount", user?.id],
    async () => {
      const { data, error } = await supabaseClient
        .from("accounts")
        .select()
        .eq("primary_owner_user_id", user?.id)
        .eq("personal_account", true)
        .single();
      handleSupabaseErrors(data, error);
      return data;
    },
    {
      ...options,
      enabled: !!user,
    }
  );
}
