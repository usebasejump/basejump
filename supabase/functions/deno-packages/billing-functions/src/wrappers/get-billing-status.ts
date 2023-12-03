import {SupabaseClient} from "@supabase/supabase-js";
import {AUTHORIZED_BILLING_USER_INFO} from "../require-authorized-billing-user.ts";
import {BILLING_FUNCTION_WRAPPER_HANDLERS, GET_BILLING_STATUS_RESPONSE,} from "../billing-functions-wrapper.ts";
import {upsertCustomerSubscription} from "../../lib/upsert-data.ts";

/**
 * Responsible for handling the local data cache update for billing status
 * from the given handler.
 * @param supabaseClient
 * @param roleInfo
 * @param handlers
 */
export default async function getBillingStatus(
    supabaseClient: SupabaseClient,
    roleInfo: AUTHORIZED_BILLING_USER_INFO,
    handlers: BILLING_FUNCTION_WRAPPER_HANDLERS
): Promise<GET_BILLING_STATUS_RESPONSE> {
    const billingData = await handlers.getBillingStatus({
        accountId: roleInfo.account_id,
        billingEmail: roleInfo.billing_email,
        customerId: roleInfo.billing_customer_id,
        subscriptionId: roleInfo.billing_subscription_id,
    });

    const data = await upsertCustomerSubscription(
        supabaseClient,
        roleInfo.account_id,
        billingData
    );

    return {
        subscription_id: billingData?.subscription?.id,
        plan_name: billingData?.subscription?.plan_name,
        subscription_active: ["trialing", "active"].includes(
            billingData?.subscription?.status
        ),
        status: billingData?.subscription?.status,
        billing_email: billingData?.customer?.billing_email,
        account_role: roleInfo.account_role,
        is_primary_owner: roleInfo.is_primary_owner,
        billing_enabled: roleInfo.billing_enabled,
    };
}
