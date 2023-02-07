import { Menu } from "react-daisyui";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import cx from "classnames";
import { UseDashboardOverviewResponse } from "@/utils/api/use-dashboard-overview";
import { useMemo } from "react";
import { ACCOUNT_ROLES } from "@/types/auth";

type Props = {
  currentAccount: UseDashboardOverviewResponse[0];
};
const PersonalAccountMenu = ({ currentAccount }: Props) => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const menu = useMemo(() => {
    const internal = [
      {
        label: t("personalAccountMenu.dashboard"),
        href: "/dashboard",
        isActive: router.asPath === "/dashboard",
      },
      {
        label: t("personalAccountMenu.profile"),
        href: "/dashboard/profile",
        isActive: router.asPath === "/dashboard/profile",
      },
    ];
    if (currentAccount?.account_role === ACCOUNT_ROLES.owner) {
      internal.push({
        label: t("personalAccountMenu.billing"),
        href: "/dashboard/billing",
        isActive: router.asPath === "/dashboard/billing",
      });
    }
    return internal;
  }, [router.asPath, currentAccount, t]);
  return (
    <Menu>
      {menu.map((item) => (
        <Menu.Item key={item.label} className={cx({ bordered: item.isActive })}>
          <Link href={item.href} passHref>
            {item.label}
          </Link>
        </Menu.Item>
      ))}
    </Menu>
  );
};

export default PersonalAccountMenu;
