import DashboardContent from "@/components/dashboard/shared/dashboard-content";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import { useMemo } from "react";
import Link from "next/link";
import cx from "classnames";

const AccountSettingsLayout = ({ children }) => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const { accountId } = router.query;
  const tabs = useMemo(() => {
    return [
      {
        label: t("teamAccountSettings.tabs.general"),
        href: `/dashboard/teams/${accountId}/settings`,
        isActive: router.asPath === `/dashboard/teams/${accountId}/settings`,
      },
      {
        label: t("teamAccountSettings.tabs.members"),
        href: `/dashboard/teams/${accountId}/settings/members`,
        isActive:
          router.asPath === `/dashboard/teams/${accountId}/settings/members`,
      },
      {
        label: t("teamAccountSettings.tabs.billing"),
        href: `/dashboard/teams/${accountId}/settings/billing`,
        isActive:
          router.asPath === `/dashboard/teams/${accountId}/settings/billing`,
      },
    ];
  }, [accountId, router.asPath, t]);
  return (
    <DashboardContent>
      <DashboardContent.Title>
        {t("teamAccountSettings.pageTitle")}
      </DashboardContent.Title>
      <DashboardContent.Tabs>
        <div className="tabs">
          {tabs.map(({ label, href, isActive }) => (
            <Link
              href={href}
              key={href}
              className={cx("tab tab-lg", {
                "tab-bordered tab-active": isActive,
              })}
            >
              {label}
            </Link>
          ))}
        </div>
      </DashboardContent.Tabs>
      <DashboardContent.Content>{children}</DashboardContent.Content>
    </DashboardContent>
  );
};

export default AccountSettingsLayout;
