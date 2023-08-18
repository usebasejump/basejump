import { Database as BASEJUMP_DATABASE_SCHEMA } from "../types/basejump-database.ts";
import { requireAuthorizedBillingUser } from "./require-authorized-billing-user.ts";
import getBillingStatus from "./wrappers/get-billing-status.ts";
import createSupabaseServiceClient from "../lib/create-supabase-service-client.ts";
import { corsHeaders } from "../lib/cors-headers.ts";
import { BASEJUMP_BILLING_DATA_UPSERT } from "../lib/upsert-data.ts";

type GET_PLANS_ARGS = {
  account_id?: string;
};

type GET_PLANS_RESPONSE = Array<{
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval: "month" | "year" | "one_time";
  interval_count: 1;
  trial_period_days?: 30;
  active?: boolean;
  metadata?: {
    [key: string]: string;
  };
}>;

type GET_BILLING_PORTAL_URL_ARGS = {
  accountId: string;
  subscriptionId: string;
  customerId?: string;
  returnUrl: string;
};

type GET_NEW_SUBSCRIPTION_URL_ARGS = {
  accountId: string;
  planId: string;
  returnUrl: string;
  billingEmail: string;
  customerId?: string;
};

type GET_BILLING_STATUS_ARGS = {
  accountId: string;
  billingEmail?: string;
  defaultPlanId?: string;
  defaultTrialDays?: number;
  customerId?: string;
  subscriptionId?: string;
};

type GENERIC_URL_RESPONSE = {
  url: string;
};

export type GET_BILLING_STATUS_RESPONSE = {
  subscription_id: string;
  subscription_active: boolean;
  status: BASEJUMP_DATABASE_SCHEMA["public"]["Tables"]["billing_subscriptions"]["Row"]["status"];
  billing_email?: string;
  account_role: BASEJUMP_DATABASE_SCHEMA["public"]["Tables"]["account_user"]["Row"]["account_role"];
  is_primary_owner: boolean;
  billing_enabled: boolean;
};

export type BILLING_FUNCTION_WRAPPER_HANDLERS = {
  provider: BASEJUMP_DATABASE_SCHEMA["public"]["Tables"]["billing_providers"]["Row"]["provider"];
  getPlans: (args: GET_PLANS_ARGS) => Promise<GET_PLANS_RESPONSE>;
  getBillingPortalUrl: (
    args: GET_BILLING_PORTAL_URL_ARGS
  ) => Promise<GENERIC_URL_RESPONSE>;
  getNewSubscriptionUrl: (
    args: GET_NEW_SUBSCRIPTION_URL_ARGS
  ) => Promise<GENERIC_URL_RESPONSE>;
  getBillingStatus: (
    args: GET_BILLING_STATUS_ARGS
  ) => Promise<BASEJUMP_BILLING_DATA_UPSERT>;
};

export function billingFunctionsWrapper(
  handlers: BILLING_FUNCTION_WRAPPER_HANDLERS
): (req: Request) => Promise<Response> {
  return async function (req: Request) {
    // check for options preflight and handle cors
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    const body = await req.json();
    try {
      switch (body.action) {
        case "get_plans":
          const plans = await handlers.getPlans(body.args);
          return new Response(JSON.stringify(plans), {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          });
        case "get_billing_portal_url":
          return await requireAuthorizedBillingUser(req, {
            accountId: body.args.account_id,
            authorizedRoles: ["owner"],
            async onBillableAndAuthorized(roleInfo) {
              const response = await handlers.getBillingPortalUrl({
                accountId: roleInfo.account_id,
                subscriptionId: roleInfo.billing_subscription_id,
                customerId: roleInfo.billing_customer_id,
                returnUrl: body.args.return_url,
              });
              return new Response(
                JSON.stringify({
                  billing_enabled: roleInfo.billing_enabled,
                  ...response,
                }),
                {
                  headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                  },
                }
              );
            },
          });
        case "get_new_subscription_url":
          return await requireAuthorizedBillingUser(req, {
            accountId: body.args.account_id,
            authorizedRoles: ["owner"],
            async onBillableAndAuthorized(roleInfo) {
              const response = await handlers.getNewSubscriptionUrl({
                accountId: roleInfo.account_id,
                planId: body.args.plan_id,
                returnUrl: body.args.return_url,
                billingEmail: roleInfo.billing_email,
                customerId: roleInfo.billing_customer_id,
              });
              return new Response(
                JSON.stringify({
                  billing_enabled: roleInfo.billing_enabled,
                  ...response,
                }),
                {
                  headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                  },
                }
              );
            },
          });

        case "get_billing_status":
          return await requireAuthorizedBillingUser(req, {
            accountId: body.args.account_id,
            authorizedRoles: ["owner"],
            async onBillableAndAuthorized(roleInfo) {
              const supabaseClient = createSupabaseServiceClient();
              const response = await getBillingStatus(
                supabaseClient,
                roleInfo,
                handlers
              );

              return new Response(
                JSON.stringify({
                  ...response,
                  billing_enabled: roleInfo.billing_enabled,
                }),
                {
                  headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                  },
                }
              );
            },
          });

        default:
          return new Response(
            JSON.stringify({
              error: "Invalid action",
            }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
      }
    } catch (e) {
      console.log(e);
      return new Response(
        JSON.stringify({ error: "Unable to lookup account information" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  };
}
