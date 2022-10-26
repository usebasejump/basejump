import useTeamAccounts from "@/utils/api/use-team-accounts";
import SettingsCard from "@/components/dashboard/shared/settings-card";
import useTranslation from "next-translate/useTranslation";
import Loader from "@/components/core/loader";
import { DASHBOARD_PATH } from "@/types/auth";
import { useRouter } from "next/router";
import { useToggle } from "react-use";
import NewAccountModal from "@/components/dashboard/accounts/new-account-modal";
import { Button } from "react-daisyui";
import Link from "next/link";

const ListTeams = () => {
  const [newAccount, toggleNewAccount] = useToggle(false);
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const { data, isLoading, refetch } = useTeamAccounts();

  async function onAccountCreated(accountId: string) {
    await refetch();
    toggleNewAccount(false);
    await router.push(`${DASHBOARD_PATH}?accountId=${accountId}`);
  }

  return (
    <>
      <SettingsCard
        title={t("listTeams.title")}
        description={t("listTeams.description")}
      >
        {isLoading ? (
          <Loader className="mx-auto mt-8" />
        ) : (
          <div className="divide-y divide-base-outline">
            {data?.map((account) => (
              <div key={account.id} className="grid grid-cols-1 md:grid-cols-4">
                <div className="md:col-span-3 pl-6 py-3" key={account.id}>
                  <p className="font-bold">{account.team_name}</p>
                  <p>{account.account_role}</p>
                </div>
                <div className="col-span-1 px-6 py-3 flex gap-x-2 md:justify-end">
                  <Link
                    href={`/dashboard/teams/${account.id}`}
                    passHref
                    className="btn btn-outline"
                  >
                    {t("listTeams.viewTeam")}
                  </Link>
                  <Link
                    href={`/dashboard/teams/${account.id}/settings`}
                    passHref
                    className="btn btn-ghost"
                  >
                    {t("listTeams.manageTeam")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        <SettingsCard.Footer>
          <Button color="primary" onClick={toggleNewAccount}>
            {t("listTeams.createTeam")}
          </Button>
        </SettingsCard.Footer>
      </SettingsCard>
      <NewAccountModal
        onClose={toggleNewAccount}
        open={newAccount}
        onComplete={onAccountCreated}
      />
    </>
  );
};

export default ListTeams;
