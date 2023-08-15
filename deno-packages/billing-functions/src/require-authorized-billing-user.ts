import { createSupabaseClient } from "../deps.ts";
import { BASEJUMP_DATABASE_SCHEMA } from "../mod.ts";

export type AUTHORIZED_BILLING_USER_INFO = {
  account_role: BASEJUMP_DATABASE_SCHEMA["public"]["Tables"]["account_user"]["Row"]["account_role"];
  is_primary_owner: boolean;
  is_personal_account: boolean;
  account_id: string;
  billing_subscription_id: string;
  billing_status: string;
  billing_customer_id: string;
  billing_email: string;
  billing_enabled: boolean;
  billing_default_plan_id?: string;
  billing_default_trial_days?: number;
  billing_provider?: string;
};

type REQUIRE_AUTHORIZED_BILLING_USER_OPTIONS = {
  accountId: string;
  authorizedRoles: string[];
  onBillingDisabled?: () => Promise<Response>;
  onUnauthorized?: () => Promise<Response>;
  onBillableAndAuthorized?: (
    roleInfo: AUTHORIZED_BILLING_USER_INFO
  ) => Promise<Response>;
  onError?: (e: Error) => Promise<Response>;
};

export async function requireAuthorizedBillingUser(
  req: Request,
  options: REQUIRE_AUTHORIZED_BILLING_USER_OPTIONS
): Promise<Response> {
  try {
    const authToken = req.headers.get("Authorization");
    // we don't have what we need. instant block.
    if (!authToken || !accountId) {
      if (options.onUnauthorized) {
        return await options.onUnauthorized();
      }
      return new Response("Unauthorized", { status: 401 });
    }

    const supabase = createSupabaseClient(authToken);
    const { data, error } = await supabase.rpc("get_account_billing_status", {
      account_id: options.accountId,
    });
    // means this user isn't a member of this account, block
    if (!data || error) {
      if (options.onUnauthorized) {
        return await options.onUnauthorized();
      }
      return new Response("Unauthorized", { status: 401 });
    }

    // means this user is a member of this account, but not the right role, block
    if (!options.authorizedRoles.includes(data.account_role)) {
      if (options.onUnauthorized) {
        return await options.onUnauthorized();
      }
      return new Response("Unauthorized", { status: 401 });
    }

    // means this user is a member of this account, but billing is disabled, just return a generic response
    if (!data.billing_enabled) {
      if (options.onBillingDisabled) {
        return await options.onBillingDisabled();
      }
      return new Response(
        {
          billing_enabled: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // means this user is a member of this account, and has the right role, allow
    return await options.onBillableAndAuthorized(data);
  } catch (e) {
    // something went wrong, throw an error
    if (options.onError) {
      return options.onError(e);
    } else {
      return new Response("Internal Error", { status: 500 });
    }
  }
}
