import { Menu } from "react-daisyui";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import cx from "classnames";
import { useMemo } from "react";
import { ACCOUNT_ROLES } from "@/types/auth";
import { UseDashboardOverviewResponse } from "@/utils/api/use-dashboard-overview";

type Props = {
  currentAccount: UseDashboardOverviewResponse[0];
};

const TeamAccountMenu = ({ currentAccount }: Props) => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const menu = useMemo(() => {
    const items = [
      {
        label: t("teamAccountMenu.dashboard"),
        href: `/dashboard/teams/${currentAccount.account_id}`,
        isActive: router.pathname === "/dashboard/teams/[accountId]",
      },
    ];
    if (currentAccount.account_role === ACCOUNT_ROLES.owner) {
      items.push({
        label: t("teamAccountMenu.settings"),
        href: `/dashboard/teams/${currentAccount.account_id}/settings`,
        isActive: router.pathname.includes(
          "/dashboard/teams/[accountId]/settings"
        ),
      });
    }
    return items;
  }, [currentAccount, router.pathname, t]);
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

export default TeamAccountMenu;
