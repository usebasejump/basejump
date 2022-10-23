import AccountSettingsLayout from "@/components/dashboard/accounts/settings/account-settings-layout";
import AccountSubscription from "@/components/dashboard/accounts/settings/account-subscription";
import { useRouter } from "next/router";
import useTeamAccount from "@/utils/api/use-team-account";
import useTranslation from "next-translate/useTranslation";
import DashboardMeta from "@/components/dashboard/dashboard-meta";

const TeamSettingsBilling = () => {
  const router = useRouter();
  const { accountId } = router.query;
  const { data } = useTeamAccount(accountId as string);
  const { t } = useTranslation("dashboard");
  return (
    <AccountSettingsLayout>
      <DashboardMeta
        title={t("dashboardMeta.teamBilling", { teamName: data?.team_name })}
      />
      <AccountSubscription accountId={accountId as string} />
    </AccountSettingsLayout>
  );
};

export default TeamSettingsBilling;
