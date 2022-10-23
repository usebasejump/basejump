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
      const { data, error } = await supabaseClient
        .from("billing_products")
        .select(
          "name, description, billing_prices (currency, unit_amount, id, interval, type)"
        );

      handleSupabaseErrors(data, error);

      const results = [];

      data?.forEach((product) => {
        // @ts-ignore
        product.billing_prices?.forEach((price) => {
          results.push({
            product_name: product.name,
            product_description: product.description,
            currency: price.currency,
            price: price.unit_amount,
            price_id: price.id,
            interval: price.type === "one_time" ? "one_time" : price.interval,
          });
        });
      });

      return results;
    },
    {
      ...options,
      enabled: !!accountId && !!user && !!supabaseClient,
    }
  );
}
