import FutureContentPlaceholder from "@/components/basejump-default-content/future-content-placeholder";
import { useRouter } from "next/router";
import useTeamAccount from "@/utils/api/use-team-account";
import useTranslation from "next-translate/useTranslation";
import DashboardMeta from "@/components/dashboard/dashboard-meta";

const DashboardTeamIndex = () => {
  const router = useRouter();
  const { accountId } = router.query;
  const { data } = useTeamAccount(accountId as string);
  const { t } = useTranslation("dashboard");
  return (
    <>
      <DashboardMeta
        title={t("dashboardMeta.teamDashboard", { teamName: data?.team_name })}
      />
      <FutureContentPlaceholder filePath="/src/pages/dashboard/teams/[accountId]/index.mdx" />
    </>
  );
};

export default DashboardTeamIndex;
