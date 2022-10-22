import { Button } from "react-daisyui";
import cx from "classnames";
import { XIcon } from "@heroicons/react/outline";
import ProfileButton from "@/components/dashboard/sidebar/profile-button";
import ThemeSelector from "@/components/dashboard/sidebar/theme-selector";
import TeamAccountMenu from "@/components/dashboard/sidebar/team-account-menu";
import PersonalAccountMenu from "@/components/dashboard/sidebar/personal-account-menu";
import TeamSelectMenu from "@/components/dashboard/sidebar/team-select-menu";
import { UseDashboardOverviewResponse } from "@/utils/api/use-dashboard-overview";
import Logo from "@/components/basejump-default-content/logo";

type Props = {
  className?: string;
  onClose?: () => void;
  currentAccount?: UseDashboardOverviewResponse[0];
};
const SidebarMenu = ({ className, onClose, currentAccount }: Props) => {
  return (
    <div
      className={cx(
        "bg-base-300 md:w-72 flex flex-col justify-between",
        className
      )}
    >
      <div className="grid gap-y-4">
        <div className="flex justify-between items-center p-4">
          <Logo size="sm" />
          <Button
            className="md:hidden"
            shape="square"
            color="ghost"
            onClick={onClose}
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
        <div className="px-4 grid">
          <TeamSelectMenu currentAccount={currentAccount} />
        </div>
        {currentAccount?.team_account === true ? (
          <TeamAccountMenu currentAccount={currentAccount} />
        ) : (
          <PersonalAccountMenu currentAccount={currentAccount} />
        )}
      </div>

      <div className="flex justify-between items-center p-4 border-t border-base-100">
        <ProfileButton className="flex-grow" />
        <ThemeSelector />
      </div>
    </div>
  );
};

export default SidebarMenu;
