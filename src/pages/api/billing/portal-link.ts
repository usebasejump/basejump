import { withApiAuth } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";
import { createOrRetrieveCustomer } from "@/utils/admin/stripe-billing-helpers";
import { stripe } from "@/utils/admin/stripe";
import getFullRedirectUrl from "@/utils/get-full-redirect-url";
import { ACCOUNT_ROLES } from "@/types/auth";

const createPortalLink = async (
  req: NextApiRequest,
  res: NextApiResponse,
  supabaseServerClient
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({ error: "Missing account ID" });
  }

  const { data: currentUserRole } = await supabaseServerClient
    .rpc("current_user_account_role", {
      lookup_account_id: accountId,
    })
    .single();

  // only owners are allowed to update billing subscriptions
  if (currentUserRole?.account_role !== ACCOUNT_ROLES.owner) {
    return res.status(404).json({ error: "Account not found" });
  }

  try {
    const {
      data: { user },
    } = await supabaseServerClient.auth.getUser();
    const customer = await createOrRetrieveCustomer({
      accountId: accountId as string,
      email: user.email || "",
    });

    if (!customer) throw Error("Could not get customer");
    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: getFullRedirectUrl(
        currentUserRole?.is_personal_account
          ? "/dashboard/billing"
          : `/dashboard/teams/${accountId}/settings/billing`
      ),
    });

    return res.status(200).json({ url });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: { statusCode: 500, message: err.message } });
  }
};

export default withApiAuth(createPortalLink);
