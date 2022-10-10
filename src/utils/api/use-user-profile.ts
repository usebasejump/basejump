import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import handleSupabaseErrors from "@/utils/handle-supabase-errors";
import { definitions } from "@/types/supabase-generated";

export default function useUserProfile() {
  const { user, error } = useUser();
  return useQuery<definitions["profiles"], Error>(
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
      enabled: !!user,
    }
  );
}
