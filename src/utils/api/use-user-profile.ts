import { useSessionContext, useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import handleSupabaseErrors from "@/utils/handle-supabase-errors";
import { Database } from "@/types/supabase-types";

export default function useUserProfile() {
  const user = useUser();
  const { supabaseClient } = useSessionContext();
  return useQuery<Database["public"]["Tables"]["profiles"]["Row"], Error>(
    ["userProfile", user?.id],
    async () => {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();
      handleSupabaseErrors(data, error);
      return data;
    },
    {
      enabled: !!user && !!supabaseClient,
    }
  );
}
