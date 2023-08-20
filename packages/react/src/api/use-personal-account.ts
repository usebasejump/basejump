import { SupabaseClient } from "@supabase/supabase-js";
import { GET_ACCOUNT_RESPONSE } from "@usebasejump/shared";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type Props = {
  supabaseClient?: SupabaseClient<any> | null;
  options?: UseQueryOptions;
};

export const usePersonalAccount = ({ supabaseClient, options }: Props) => {
  return useQuery<GET_ACCOUNT_RESPONSE>({
    queryKey: ["personal-account"],
    queryFn: async () => {
      const { data, error } = await supabaseClient.rpc("get_personal_account");

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!supabaseClient,
    ...options,
  });
};
