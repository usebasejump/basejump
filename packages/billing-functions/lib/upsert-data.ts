import { BASEJUMP_DATABASE_SCHEMA } from "../mod.ts";

export type BASEJUMP_BILLING_DATA_UPSERT = {
  provider: BASEJUMP_DATABASE_SCHEMA["public"]["Tables"]["billing_providers"]["Row"]["provider"];
  customer?: {
    id: string;
    billing_email?: string;
    account_id: string;
    provider: string;
  };
  subscription?: {
    id: string;
    billing_customer_id?: string;
    status: BASEJUMP_DATABASE_SCHEMA["public"]["Tables"]["billing_subscriptions"]["Row"]["status"];
    account_id: string;
    created_at: Date;
    updated_at: Date;
    cancel_at?: Date;
    cancel_at_period_end?: boolean;
    canceled_at?: Date;
    current_period_end?: Date;
    current_period_start?: Date;
    ended_at?: Date;
    metadata?: {
      [key: string]: any;
    };
    price_id?: string;
    quantity?: number;
    trial_end?: Date;
    trial_start?: Date;
    plan_name?: string;
    provider: string;
  };
};

export async function upsertCustomerSubscription(
  supabaseClient,
  accountId,
  upsertData: BASEJUMP_BILLING_DATA_UPSERT
) {
  const { data, error } = await supabaseClient.rpc(
    "service_role_upsert_customer_subscription",
    {
      account_id: accountId,
      provider: upsertData.provider,
      customer: upsertData.customer,
      subscription: upsertData.subscription,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}
