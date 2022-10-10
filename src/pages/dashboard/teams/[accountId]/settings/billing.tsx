import AccountSettingsLayout from "@/components/dashboard/accounts/settings/account-settings-layout";
import AccountSubscription from "@/components/dashboard/accounts/settings/account-subscription";
import { useRouter } from "next/router";

const TeamSettingsBilling = () => {
  const router = useRouter();
  const { accountId } = router.query;
  return (
    <AccountSettingsLayout>
      <AccountSubscription accountId={accountId as string} />
    </AccountSettingsLayout>
  );
};

export default TeamSettingsBilling;
