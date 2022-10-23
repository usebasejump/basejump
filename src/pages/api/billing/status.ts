import { NextApiRequest, NextApiResponse } from "next";
import { createOrRetrieveSubscription } from "@/utils/admin/stripe-billing-helpers";
import { withApiAuth } from "@supabase/auth-helpers-nextjs";
import { MANUAL_SUBSCRIPTION_REQUIRED } from "@/types/billing";

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

  if (!data) {
    return res.status(404).json({ error: "Account not found" });
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
      });
    }
    return res.status(500).json({ error: error.message });
  }
};

export default withApiAuth(BillingStatus);
