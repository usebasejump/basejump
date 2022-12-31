import { useSessionContext, useUser } from "@supabase/auth-helpers-react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Database } from "@/types/supabase-types";

type UseAccountBillingStatusResponse = {
  subscription_id: string;
  subscription_active: boolean;
  status: string;
  is_primary_owner: boolean;
  billing_email?: string;
  plan_name?: string;
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
      const response = await fetch(
        `/api/billing/status?accountId=${accountId}`
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      return data;
    },
    {
      ...options,
      enabled: !!accountId && !!user && !!supabaseClient,
    }
  );
}
