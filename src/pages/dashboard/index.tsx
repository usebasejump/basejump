import Loader from "@/components/core/loader";
import usePersonalAccount from "@/utils/api/use-personal-account";
import PersonalAccountDeactivated from "@/components/dashboard/accounts/personal-account-deactivated";
import FutureContentPlaceholder from "@/components/basejump-default-content/future-content-placeholder";
import useTranslation from "next-translate/useTranslation";
import DashboardMeta from "@/components/dashboard/dashboard-meta";

const DashboardIndex = () => {
  const { data: personalAccount, isLoading } = usePersonalAccount();
  const { t } = useTranslation("dashboard");
  /**
   * This page does the heavy lifting for handling the fact that
   * Basejump supports personal accounts, team accounts and a combination
   * of both. If no personal account is loaded, it means that personal
   * accounts are deactivated. In that case, we show current teams and
   * prompt them to create one if none exist. If a personal account is
   * loaded, we show the personal account dashboard page
   */

  return (
    <>
      <DashboardMeta title={t("dashboardMeta.dashboard")} />
      {isLoading ? (
        <Loader className="h-8 mx-auto pt-10" />
      ) : !personalAccount ? (
        // Personal accounts are deactivated, so we
        // prompt the user to jump to a team dashboard
        <div className="max-w-md mx-auto pt-10">
          <PersonalAccountDeactivated />
        </div>
      ) : (
        //  Replace me with your content!
        <FutureContentPlaceholder filePath="/src/pages/dashboard/index.mdx" />
      )}
    </>
  );
};

export default DashboardIndex;
