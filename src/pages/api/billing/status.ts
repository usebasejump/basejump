import { NextApiRequest, NextApiResponse } from "next";
import { createOrRetrieveSubscription } from "@/utils/admin/stripe-billing-helpers";
import { withApiAuth } from "@supabase/auth-helpers-nextjs";
import { MANUAL_SUBSCRIPTION_REQUIRED } from "@/types/billing";
import { supabaseAdmin } from "@/utils/admin/supabase-admin-client";

const BillingStatus = async (
  req: NextApiRequest,
  res: NextApiResponse,
  supabaseServerClient
) => {
  const { accountId } = req.query;

  if (!accountId) {
    return res.status(400).json({ error: "Missing account ID" });
  }

  const {
    data: { user },
  } = await supabaseServerClient.auth.getUser();

  const { data } = await supabaseServerClient
    .rpc("current_user_account_role", {
      lookup_account_id: accountId,
    })
    .single();

  const { data: config } = await supabaseAdmin
    .rpc("get_service_role_config")
    .single();

  if (!data) {
    return res.status(404).json({ error: "Account not found" });
  }

  // @ts-ignore
  if (config.enable_account_billing === false) {
    // If billing is disabled, return the account as active
    return res.status(200).json({
      subscription_id: null,
      subscription_active: true,
      status: "active",
      is_primary_owner: false,
      billing_email: null,
      plan_name: null,
      account_role: data.account_role,
      billing_enabled: false,
    });
  }

  try {
    const subscriptionData = await createOrRetrieveSubscription({
      accountId: accountId as string,
      email: user.email,
    });
    return res.status(200).json({
      subscription_id: subscriptionData.id,
      subscription_active: ["trialing", "active"].includes(
        subscriptionData.status
      ),
      plan_name: subscriptionData.plan_name,
      billing_email: subscriptionData.billing_email,
      status: subscriptionData.status,
      account_role: data?.account_role,
      is_primary_owner: data?.is_primary_owner,
      billing_enabled: true,
    });
  } catch (error) {
    if (error.message === MANUAL_SUBSCRIPTION_REQUIRED) {
      return res.status(200).json({
        subscription_id: null,
        subscription_active: false,
        plan_name: null,
        billing_email: null,
        status: MANUAL_SUBSCRIPTION_REQUIRED,
        account_role: data?.account_role,
        is_primary_owner: data?.is_primary_owner,
        billing_enabled: true,
      });
    }
    return res.status(500).json({ error: error.message });
  }
};

export default withApiAuth(BillingStatus);
