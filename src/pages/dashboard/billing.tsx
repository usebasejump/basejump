import DashboardContent from "@/components/dashboard/shared/dashboard-content";
import useTranslation from "next-translate/useTranslation";
import AccountSubscription from "@/components/dashboard/accounts/settings/account-subscription";
import usePersonalAccount from "@/utils/api/use-personal-account";

const PersonalAccountBilling = () => {
  const { t } = useTranslation("dashboard");
  const { data } = usePersonalAccount();
  return (
    <DashboardContent>
      <DashboardContent.Title>{t("billing.pageTitle")}</DashboardContent.Title>
      <DashboardContent.Content>
        <AccountSubscription accountId={data?.id} />
      </DashboardContent.Content>
    </DashboardContent>
  );
};

export default PersonalAccountBilling;
