import { SupabaseClient } from "@supabase/supabase-js";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { GET_ACCOUNT_RESPONSE } from "@usebasejump/shared";

type Props = {
  accountId?: string;
  accountSlug?: string;
  supabaseClient?: SupabaseClient<any> | null;
  options?: UseQueryOptions;
};

export const useAccount = ({
  supabaseClient,
  accountId,
  accountSlug,
  options,
}: Props) => {
  console.log("boop", accountSlug);
  return useQuery<GET_ACCOUNT_RESPONSE>({
    queryKey: ["account", accountId || accountSlug],
    queryFn: async () => {
      if (accountId) {
        const { data, error } = await supabaseClient.rpc("get_account", {
          account_id: accountId,
        });

        if (error) {
          throw new Error(error.message);
        }

        return data;
      }
      const { data, error } = await supabaseClient.rpc("get_account_by_slug", {
        slug: accountSlug,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!supabaseClient && (!!accountId || !!accountSlug),
    ...options,
  });
};
