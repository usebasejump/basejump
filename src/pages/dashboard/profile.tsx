import UpdateProfileName from "@/components/dashboard/profile/update-profile-name";
import DashboardContent from "@/components/dashboard/shared/dashboard-content";
import UpdateEmailAddress from "@/components/dashboard/profile/update-email-address";
import useTranslation from "next-translate/useTranslation";
import ListTeams from "@/components/dashboard/profile/list-teams";
import DashboardMeta from "@/components/dashboard/dashboard-meta";

const DashboardProfile = () => {
  const { t } = useTranslation("dashboard");
  return (
    <DashboardContent>
      <DashboardMeta title={t("dashboardMeta.profile")} />
      <DashboardContent.Title>{t("profile.pageTitle")}</DashboardContent.Title>
      <DashboardContent.Content>
        <div className="grid gap-y-6">
          <UpdateProfileName />
          <UpdateEmailAddress />
          <ListTeams />
        </div>
      </DashboardContent.Content>
    </DashboardContent>
  );
};

export default DashboardProfile;
