import { SupabaseClient } from "@supabase/supabase-js";
import { GET_ACCOUNT_BILLING_STATUS_RESPONSE } from "@usebasejump/shared";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

type Props = {
  accountId?: string;
  supabaseClient?: SupabaseClient<any> | null;
  options?: UseQueryOptions;
};

export const useAccountBillingStatus = ({
  supabaseClient,
  accountId,
  options,
}: Props): UseQueryResult<GET_ACCOUNT_BILLING_STATUS_RESPONSE> => {
  return useQuery<GET_ACCOUNT_BILLING_STATUS_RESPONSE>({
    queryKey: ["account-billing-status", accountId],
    enabled: !!accountId && !!supabaseClient,
    queryFn: async () => {
      if (!supabaseClient) {
        throw new Error("Client not yet loaded");
      }
      if (!accountId) {
        throw new Error("Account ID required");
      }

      const { data, error } = await supabaseClient.functions.invoke(
        "billing-functions",
        {
          body: {
            action: "get_billing_status",
            args: {
              account_id: accountId,
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    ...options,
  });
};
