import DashboardContent from "@/components/dashboard/shared/dashboard-content";
import useTranslation from "next-translate/useTranslation";
import AccountSubscription from "@/components/dashboard/accounts/settings/account-subscription";
import usePersonalAccount from "@/utils/api/use-personal-account";
import DashboardMeta from "@/components/dashboard/dashboard-meta";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { LOGIN_PATH } from "@/types/auth";

const PersonalAccountBilling = () => {
  const { t } = useTranslation("dashboard");
  const { data } = usePersonalAccount();
  return (
    <DashboardContent>
      <DashboardMeta title={t("dashboardMeta.billing")} />
      <DashboardContent.Title>{t("billing.pageTitle")}</DashboardContent.Title>
      <DashboardContent.Content>
        <AccountSubscription accountId={data?.id} />
      </DashboardContent.Content>
    </DashboardContent>
  );
};

export default PersonalAccountBilling;

export const getServerSideProps = withPageAuth({ redirectTo: LOGIN_PATH });
