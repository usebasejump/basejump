import useTranslation from "next-translate/useTranslation";
import { Button, Dropdown, Menu } from "react-daisyui";
import { PlusIcon } from "@heroicons/react/solid";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { DASHBOARD_PATH } from "@/types/auth";
import { useToggle } from "react-use";
import { useRouter } from "next/router";
import Link from "next/link";
import NewAccountModal from "@/components/dashboard/accounts/new-account-modal";
import useDashboardOverview, {
  UseDashboardOverviewResponse,
} from "@/utils/api/use-dashboard-overview";
import { useMemo } from "react";

type Props = {
  currentAccount: UseDashboardOverviewResponse[0];
};

const TeamSelectMenu = ({ currentAccount }: Props) => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const [newAccount, toggleNewAccount] = useToggle(false);

  const { data, refetch } = useDashboardOverview();

  const personalAccount = useMemo(
    () => data?.find((a) => a.personal_account),
    [data]
  );

  const teamAccounts = useMemo(
    () => data?.filter((a) => a.team_account),
    [data]
  );

  async function onAccountCreated(accountId: string) {
    await refetch();
    toggleNewAccount(false);
    await router.push(`/dashboard/teams/${accountId}`);
  }

  return (
    <>
      <Dropdown horizontal="center" className="w-full">
        <Button
          variant="outline"
          fullWidth
          className="border w-full flex justify-between items-center flex-nowrap"
        >
          <p>
            {currentAccount?.team_account
              ? currentAccount.team_name
              : t("teamSelectMenu.myAccount")}
          </p>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
        <Dropdown.Menu className="w-full max-h-64 overflow-y-scroll">
          {!!personalAccount && (
            <>
              <Menu.Title>
                <p>{t("teamSelectMenu.personalAccount")}</p>
              </Menu.Title>
              <Link href={DASHBOARD_PATH} passHref legacyBehavior>
                <Dropdown.Item>{t("teamSelectMenu.myAccount")}</Dropdown.Item>
              </Link>
            </>
          )}
          <Menu.Title>
            <p>{t("teamSelectMenu.teams")}</p>
          </Menu.Title>
          {teamAccounts?.map((account) => (
            <Link
              key={account.account_id}
              href={`/dashboard/teams/${account.account_id}`}
              passHref
              legacyBehavior
            >
              <Dropdown.Item>{account.team_name}</Dropdown.Item>
            </Link>
          ))}
          <Dropdown.Item onClick={toggleNewAccount}>
            <div className="flex gap-x-2 items-center">
              <PlusIcon className="h-4 w-4" />
              <p>{t("teamSelectMenu.newAccount")}</p>
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <NewAccountModal
        onClose={toggleNewAccount}
        open={newAccount}
        onComplete={onAccountCreated}
      />
    </>
  );
};

export default TeamSelectMenu;
