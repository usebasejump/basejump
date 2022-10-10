import SettingsCard from "@/components/dashboard/shared/settings-card";
import useTranslation from "next-translate/useTranslation";
import Loader from "@/components/core/loader";
import useTeamMembers from "@/utils/api/use-team-members";
import IndividualTeamMember from "@/components/dashboard/accounts/settings/individual-team-member";

type Props = {
  accountId: string;
};
const ListTeamMembers = ({ accountId }: Props) => {
  const { t } = useTranslation("dashboard");
  const { data, isLoading } = useTeamMembers(accountId);

  return (
    <SettingsCard
      title={t("listTeamMembers.title")}
      description={t("listTeamMembers.description")}
    >
      {isLoading ? (
        <Loader className="mx-auto my-8 h-8" />
      ) : (
        <div className="divide-y divide-base-outline">
          {data?.map((member) => (
            <IndividualTeamMember member={member} key={member.user_id} />
          ))}
        </div>
      )}
    </SettingsCard>
  );
};

export default ListTeamMembers;
