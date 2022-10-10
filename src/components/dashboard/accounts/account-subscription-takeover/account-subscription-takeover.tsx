import { UseDashboardOverviewResponse } from "@/utils/api/use-dashboard-overview";
import useAccountBillingStatus from "@/utils/api/use-account-billing-status";
import NewSubscription from "@/components/dashboard/accounts/account-subscription-takeover/new-subscription";
import { MANUAL_SUBSCRIPTION_REQUIRED } from "@/types/billing";
import useTranslation from "next-translate/useTranslation";
import AccountSubscription from "@/components/dashboard/accounts/settings/account-subscription";

type Props = {
  currentAccount: UseDashboardOverviewResponse[0];
};
const AccountSubscriptionTakeover = ({ currentAccount }: Props) => {
  const { t } = useTranslation("dashboard");
  const { data: subscriptionData } = useAccountBillingStatus(
    currentAccount?.account_id
  );
  return (
    <div className="p-12 z-50 absolute top-0 left-0 w-screen h-screen bg-base-100">
      {[
        "incomplete_expired",
        "canceled",
        MANUAL_SUBSCRIPTION_REQUIRED,
      ].includes(subscriptionData?.status) && (
        <>
          <h1 className="h1 mb-8 text-center">
            {t("accountSubscriptionTakeover.newSubscriptionTitle")}
          </h1>
          <NewSubscription currentAccount={currentAccount} />
        </>
      )}
      {["incomplete", "past_due", "unpaid"].includes(
        subscriptionData?.status
      ) && (
        <>
          <h1 className="h1 mb-8 text-center">
            {t(
              `accountSubscriptionTakeover.fixExistingSubscriptionTitle.${subscriptionData.status}`
            )}
          </h1>
          <AccountSubscription accountId={currentAccount.account_id} />
        </>
      )}
    </div>
  );
};

export default AccountSubscriptionTakeover;
