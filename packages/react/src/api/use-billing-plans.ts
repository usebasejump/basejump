import { SupabaseClient } from "@supabase/supabase-js";
import { GET_BILLING_PLANS_RESPONSE } from "@usebasejump/shared";
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

export const useBillingPlans = ({
  supabaseClient,
  accountId,
  options,
}: Props): UseQueryResult<GET_BILLING_PLANS_RESPONSE> => {
  return useQuery<GET_BILLING_PLANS_RESPONSE>({
    queryKey: ["billing-plans", accountId],
    enabled: !!supabaseClient,
    queryFn: async () => {
      if (!supabaseClient) {
        throw new Error("Client not yet loaded");
      }

      const { data, error } = await supabaseClient.functions.invoke(
        "billing-functions",
        {
          body: {
            action: "get_plans",
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
