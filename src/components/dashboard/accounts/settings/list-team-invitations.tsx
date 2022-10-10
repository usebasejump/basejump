import useTranslation from "next-translate/useTranslation";
import Loader from "@/components/core/loader";
import useTeamInvitations from "@/utils/api/use-team-invitations";
import IndividualTeamInvitation from "@/components/dashboard/accounts/settings/individual-team-invitation";

type Props = {
  accountId: string;
};
const ListTeamInvitations = ({ accountId }: Props) => {
  const { t } = useTranslation("dashboard");
  const { data, isLoading, refetch } = useTeamInvitations(accountId);

  return (
    <>
      {isLoading ? (
        <Loader className="mx-auto my-8 h-8" />
      ) : (
        <div className="divide-y divide-base-outline">
          {data?.map((invitation) => (
            <IndividualTeamInvitation
              onChange={() => refetch()}
              key={invitation.id}
              invitation={invitation}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ListTeamInvitations;
