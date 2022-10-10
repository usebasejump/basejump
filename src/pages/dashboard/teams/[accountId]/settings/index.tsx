import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { LOGIN_PATH } from "@/types/auth";
import AccountSettingsLayout from "@/components/dashboard/accounts/settings/account-settings-layout";
import UpdateAccountName from "@/components/dashboard/accounts/settings/update-account-name";
import { useRouter } from "next/router";

const DashboardTeamSettingsIndex = () => {
  const router = useRouter();
  const { accountId } = router.query;
  return (
    <AccountSettingsLayout>
      <UpdateAccountName accountId={accountId as string} />
    </AccountSettingsLayout>
  );
};

export default DashboardTeamSettingsIndex;

export const getServerSideProps = withPageAuth({ redirectTo: LOGIN_PATH });
