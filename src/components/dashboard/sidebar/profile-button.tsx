import { Button, Dropdown } from "react-daisyui";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

import { Database } from "@/types/supabase-types";
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import useUserProfile from "@/utils/api/use-user-profile";

type Props = {
  className?: string;
};
const DashboardProfileButton = ({ className }: Props) => {
  const { data: profile } = useUserProfile();
  const user = useUser();
  const { t } = useTranslation("dashboard");
  const supabaseClient = useSupabaseClient<Database>();
  const router = useRouter();

  const menuButtonText = useMemo(
    () => profile?.name || t("profileButton.yourAccount"),
    [profile, t]
  );
  return (
    <div className={className}>
      <Dropdown vertical="top" horizontal="center">
        <Button color="ghost" className="break-all">{menuButtonText}</Button>
        <Dropdown.Menu className="w-52">
          <div className="border-b border-base-300 p-3 mb-1">
            <p className="text-sm">{t("profileButton.loggedInAs")}</p>
            <p className="font-bold break-all">{user?.email}</p>
          </div>
          <Link href="/dashboard/profile" legacyBehavior>
            <Dropdown.Item>{t("profileButton.editProfile")}</Dropdown.Item>
          </Link>
          <Dropdown.Item
            onClick={async () => {
              await supabaseClient.auth.signOut();
              await router.push("/");
            }}
          >
            {t("shared.logOut")}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default DashboardProfileButton;
