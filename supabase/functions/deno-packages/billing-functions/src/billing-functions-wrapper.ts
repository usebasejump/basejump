import {Database as BASEJUMP_DATABASE_SCHEMA} from "../types/basejump-database.ts";
import {requireAuthorizedBillingUser} from "./require-authorized-billing-user.ts";
import getBillingStatus from "./wrappers/get-billing-status.ts";
import createSupabaseServiceClient from "../lib/create-supabase-service-client.ts";
import {corsHeaders} from "../lib/cors-headers.ts";
import {BASEJUMP_BILLING_DATA_UPSERT} from "../lib/upsert-data.ts";
import validateUrl from "../lib/validate-url.ts";
import errorResponse from "../lib/error-response.ts";

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
    successUrl: string;
    cancelUrl: string;
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
    status: BASEJUMP_DATABASE_SCHEMA["basejump"]["Tables"]["billing_subscriptions"]["Row"]["status"];
    billing_email?: string;
    account_role: BASEJUMP_DATABASE_SCHEMA["basejump"]["Tables"]["account_user"]["Row"]["account_role"];
    is_primary_owner: boolean;
    billing_enabled: boolean;
};

type BILLING_FUNCTION_WRAPPER_OPTIONS = {
    allowedURLs: Array<string>;
}

export type BILLING_FUNCTION_WRAPPER_HANDLERS = {
    provider: BASEJUMP_DATABASE_SCHEMA["basejump"]["Tables"]["billing_subscriptions"]["Row"]["provider"];
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
    handlers: BILLING_FUNCTION_WRAPPER_HANDLERS,
    options: BILLING_FUNCTION_WRAPPER_OPTIONS = {
        allowedURLs: [],
    }
): (req: Request) => Promise<Response> {
    return async function (req: Request) {
        // check for options preflight and handle cors
        if (req.method === "OPTIONS") {
            return new Response("ok", {headers: corsHeaders});
        }
        const body = await req.json();

        if (!body.args?.account_id) {
            return errorResponse("Account id is required");
        }
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
                    if (!validateUrl(body.args.return_url, options.allowedURLs)) {
                        return errorResponse("Return url is not allowed");
                    }
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
                    if (!validateUrl(body.args.success_url, options.allowedURLs) || !validateUrl(body.args.cancel_url, options.allowedURLs)) {
                        return errorResponse("Success or cancel url is not allowed");
                    }
                    return await requireAuthorizedBillingUser(req, {
                        accountId: body.args.account_id,
                        authorizedRoles: ["owner"],
                        async onBillableAndAuthorized(roleInfo) {
                            const response = await handlers.getNewSubscriptionUrl({
                                accountId: roleInfo.account_id,
                                planId: body.args.plan_id,
                                successUrl: body.args.success_url,
                                cancelUrl: body.args.cancel_url,
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
                                    status: response.status || "not_setup",
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
                    return errorResponse("Invalid action");
            }
        } catch (e) {
            console.log(e);
            return errorResponse("Internal server error", 500);
        }
    };
}
