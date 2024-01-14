import createSupabaseClient from "../lib/create-supabase-client.ts";
import {Database as BASEJUMP_DATABASE_SCHEMA} from "../types/basejump-database.ts";
import errorResponse from "../lib/error-response.ts";

export type AUTHORIZED_BILLING_USER_INFO = {
    account_role: BASEJUMP_DATABASE_SCHEMA["basejump"]["Tables"]["account_user"]["Row"]["account_role"];
    is_primary_owner: boolean;
    is_personal_account: boolean;
    account_id: string;
    billing_subscription_id: string;
    billing_status: string;
    billing_customer_id: string;
    billing_email: string;
    billing_enabled: boolean;
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
        const accountId = options.accountId;
        // we don't have what we need. instant block.
        if (!authToken || !accountId) {
            if (options.onUnauthorized) {
                return await options.onUnauthorized();
            }
            return errorResponse("Unauthorized", 401);
        }


        const supabase = createSupabaseClient(authToken);
        const {data, error} = await supabase.rpc("get_account_billing_status", {
            account_id: options.accountId,
        }) as {data: AUTHORIZED_BILLING_USER_INFO | null; error: any};



        // means this user isn't a member of this account, block
        if (!data || error) {
            if (options.onUnauthorized) {
                return await options.onUnauthorized();
            }
            return errorResponse("Unauthorized", 401);
        }

        // means this user is a member of this account, but not the right role, block
        if (!options.authorizedRoles.includes(data.account_role)) {
            if (options.onUnauthorized) {
                return await options.onUnauthorized();
            }
            return errorResponse("Unauthorized", 401);
        }

        // means this user is a member of this account, but billing is disabled, just return a generic response
        if (!data.billing_enabled) {
            if (options.onBillingDisabled) {
                return await options.onBillingDisabled();
            }
            return new Response(
                JSON.stringify({
                    billing_enabled: false,
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        if (!options.onBillableAndAuthorized) {
            return errorResponse("Config error: No onBillableAndAuthorized function passed in", 400);
        }

        // means this user is a member of this account, and has the right role, allow
        return await options.onBillableAndAuthorized?.(data);
    } catch (e) {
        // something went wrong, throw an error
        if (options.onError) {
            return options.onError(e);
        } else {
            return errorResponse("Internal Error", 500);
        }
    }
}
