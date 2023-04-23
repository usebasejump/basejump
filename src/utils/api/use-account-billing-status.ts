import { useSessionContext, useUser } from "@supabase/auth-helpers-react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Database } from "@/types/supabase-types";

type UseAccountBillingStatusResponse = {
  subscription_id: string;
  subscription_active: boolean;
  status: string;
  is_primary_owner: boolean;
  billing_email?: string;
  account_role: Database["public"]["Tables"]["account_user"]["Row"]["account_role"];
  billing_enabled: boolean;
};

/**
 * Get a given accounts billing status. Returns "missing" if it has not yet been setup.
 * @param accountId
 * @param options
 */
export default function useAccountBillingStatus(
  accountId: string,
  options?: UseQueryOptions<UseAccountBillingStatusResponse>
) {
  const user = useUser();
  const { supabaseClient } = useSessionContext();
  return useQuery<UseAccountBillingStatusResponse, Error>(
    ["accountBillingStatus", accountId],
    async () => {
      const { data, error } = await supabaseClient.functions.invoke(
        "billing-status",
        {
          body: {
            accountId,
          },
        }
      );
      if (error) {
        throw new Error(error);
      }
      return data;
    },
    {
      ...options,
      enabled: !!accountId && !!user && !!supabaseClient,
    }
  );
}
