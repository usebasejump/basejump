import AccountSettingsLayout from "@/components/dashboard/accounts/settings/account-settings-layout";
import UpdateAccountName from "@/components/dashboard/accounts/settings/update-account-name";
import { useRouter } from "next/router";
import useTeamAccount from "@/utils/api/use-team-account";
import useTranslation from "next-translate/useTranslation";
import DashboardMeta from "@/components/dashboard/dashboard-meta";

const DashboardTeamSettingsIndex = () => {
  const router = useRouter();
  const { accountId } = router.query;
  const { data } = useTeamAccount(accountId as string);
  const { t } = useTranslation("dashboard");
  return (
    <AccountSettingsLayout>
      <DashboardMeta
        title={t("dashboardMeta.teamSettings", { teamName: data?.team_name })}
      />
      <UpdateAccountName accountId={accountId as string} />
    </AccountSettingsLayout>
  );
};

export default DashboardTeamSettingsIndex;
