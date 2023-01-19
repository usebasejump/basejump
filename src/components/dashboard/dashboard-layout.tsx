import { useEffect, useMemo, useState } from "react";
import { Button, Drawer } from "react-daisyui";
import SidebarMenu from "./sidebar/sidebar-menu";
import useDashboardOverview from "@/utils/api/use-dashboard-overview";
import { useRouter } from "next/router";
import AccountSubscriptionTakeover from "@/components/dashboard/accounts/account-subscription-takeover/account-subscription-takeover";
import useAccountBillingStatus from "@/utils/api/use-account-billing-status";
import { MenuIcon } from "@heroicons/react/outline";
import Logo from "@/components/basejump-default-content/logo";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const { accountId } = router.query;

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }

  const { data, refetch: refetchDashboardOverview } = useDashboardOverview();

  useEffect(() => {
    /**
     * Close sidebar when route changes
     */
    setIsSidebarOpen(false);
    refetchDashboardOverview();
  }, [router.asPath, refetchDashboardOverview]);
  const currentAccount = useMemo(() => {
    if (!accountId) {
      return data?.find((a) => a.personal_account);
    }
    return data?.find((a) => a.account_id === accountId);
  }, [data, accountId]);

  const { data: subscriptionData } = useAccountBillingStatus(
    currentAccount?.account_id
  );

  return (
    <div className="min-h-screen">
      <Drawer
        side={
          <SidebarMenu
            currentAccount={currentAccount}
            onClose={toggleSidebar}
          />
        }
        mobile
        open={isSidebarOpen}
        onClickOverlay={toggleSidebar}
      >
        <main className="bg-base-100 min-h-screen w-full">
          <div className="flex justify-between items-center p-4 md:hidden">
            <Logo size="sm" />
            <Button
              color="ghost"
              className="md:hidden"
              shape="square"
              onClick={toggleSidebar}
            >
              <MenuIcon className="w-6 h-6" />
            </Button>
          </div>
          {children}
        </main>
      </Drawer>
      {subscriptionData?.billing_enabled &&
        !["active", "trialing"].includes(subscriptionData?.status) && (
          <AccountSubscriptionTakeover currentAccount={currentAccount} />
        )}
    </div>
  );
};

export default DashboardLayout;
