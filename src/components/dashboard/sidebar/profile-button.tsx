import useUserProfile from "@/utils/api/use-user-profile";
import useTranslation from "next-translate/useTranslation";
import { useMemo } from "react";
import { Button, Dropdown } from "react-daisyui";
import Link from "next/link";
import { useUser } from "@supabase/auth-helpers-react";

type Props = {
  className?: string;
};
const DashboardProfileButton = ({ className }: Props) => {
  const { data: profile } = useUserProfile();
  const { user } = useUser();
  const { t } = useTranslation("dashboard");

  const menuButtonText = useMemo(
    () => profile?.name || t("profileButton.yourAccount"),
    [profile]
  );
  return (
    <div className={className}>
      <Dropdown vertical="top" horizontal="center">
        <Button color="ghost">{menuButtonText}</Button>
        <Dropdown.Menu className="w-52">
          <div className="border-b border-base-300 p-3 mb-1">
            <p className="text-sm">{t("profileButton.loggedInAs")}</p>
            <p className="font-bold">{user?.email}</p>
          </div>
          <Link href="/dashboard/profile">
            <Dropdown.Item>{t("profileButton.editProfile")}</Dropdown.Item>
          </Link>
          <Dropdown.Item href="/api/auth/logout">
            {t("shared.logOut")}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default DashboardProfileButton;
