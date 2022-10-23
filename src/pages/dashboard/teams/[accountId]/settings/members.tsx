import AccountSettingsLayout from "@/components/dashboard/accounts/settings/account-settings-layout";
import SettingsCard from "@/components/dashboard/shared/settings-card";
import useTranslation from "next-translate/useTranslation";
import InviteMember from "@/components/dashboard/accounts/settings/invite-member";
import { useRouter } from "next/router";
import ListMembers from "@/components/dashboard/accounts/settings/list-team-members";
import ListTeamInvitations from "@/components/dashboard/accounts/settings/list-team-invitations";
import useTeamInvitations from "@/utils/api/use-team-invitations";
import useTeamAccount from "@/utils/api/use-team-account";
import DashboardMeta from "@/components/dashboard/dashboard-meta";

const TeamSettingsMembers = () => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const { accountId } = router.query;
  const { refetch } = useTeamInvitations(accountId as string);
  const { data } = useTeamAccount(accountId as string);
  return (
    <AccountSettingsLayout>
      <DashboardMeta
        title={t("dashboardMeta.teamMembers", { teamName: data?.team_name })}
      />
      <div className="grid gap-y-6">
        <SettingsCard
          title={t("inviteMember.title")}
          description={t("inviteMember.description")}
        >
          <div className="px-6">
            <InviteMember
              accountId={accountId as string}
              onComplete={() => refetch()}
            />
          </div>
          <ListTeamInvitations accountId={accountId as string} />
        </SettingsCard>
        <ListMembers accountId={accountId as string} />
      </div>
    </AccountSettingsLayout>
  );
};

export default TeamSettingsMembers;
