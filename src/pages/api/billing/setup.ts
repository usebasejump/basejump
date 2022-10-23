import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/utils/admin/stripe";
import getFullRedirectUrl from "@/utils/get-full-redirect-url";
import { withApiAuth } from "@supabase/auth-helpers-nextjs";
import { ACCOUNT_ROLES } from "@/types/auth";
import { createOrRetrieveCustomer } from "@/utils/admin/stripe-billing-helpers";

const BillingSetup = async (
  req: NextApiRequest,
  res: NextApiResponse,
  supabaseServerClient
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { accountId, priceId } = req.body;

  if (!accountId) {
    return res.status(400).json({ error: "Missing account ID" });
  }

  const {
    data: { user },
  } = await supabaseServerClient.auth.getUser();

  const { data: currentUserRole } = await supabaseServerClient
    .rpc("current_user_account_role", {
      lookup_account_id: accountId,
    })
    .single();

  // only owners are allowed to update billing subscriptions
  if (currentUserRole?.account_role !== ACCOUNT_ROLES.owner) {
    return res.status(404).json({ error: "Account not found" });
  }

  const customerId = await createOrRetrieveCustomer({
    accountId,
    email: user.email,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: getFullRedirectUrl(
      currentUserRole.is_personal_account
        ? "/dashboard/billing"
        : `/dashboard/teams/${accountId}/settings/billing`
    ),
    cancel_url: getFullRedirectUrl(
      currentUserRole.is_personal_account
        ? "/dashboard/billing"
        : `/dashboard/teams/${accountId}/settings/billing`
    ),
  });
  res.status(200).json({ url: session.url });
};

export default withApiAuth(BillingSetup);
