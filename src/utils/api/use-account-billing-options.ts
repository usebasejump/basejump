import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import handleSupabaseErrors from "@/utils/handle-supabase-errors";
import { Database } from "@/types/supabase-types";

export type UseAccountBillingOptionsResponse = Array<{
  product_name: string;
  product_description: string;
  currency: string;
  price: number;
  price_id: string;
  interval: string;
}>;

/**
 * Get a given accounts account-subscription-takeover status. Returns "missing" if it has not yet been setup.
 * @param accountId
 * @param options
 */
export default function useAccountBillingOptions(
  accountId: string,
  options?: UseQueryOptions<UseAccountBillingOptionsResponse>
) {
  const user = useUser();
  const supabaseClient = useSupabaseClient<Database>();
  return useQuery<UseAccountBillingOptionsResponse, Error>(
    ["accountBillingOptions", accountId],
    async () => {
      const { data, error } = await supabaseClient.functions.invoke(
        "billing-plans"
      );

      handleSupabaseErrors(data, error);

      return data;
    },
    {
      ...options,
      enabled: !!accountId && !!user && !!supabaseClient,
    }
  );
}
