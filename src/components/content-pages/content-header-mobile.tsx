import { Button, Divider, Menu } from "react-daisyui";
import cx from "classnames";
import { XIcon } from "@heroicons/react/outline";
import Logo from "@/components/basejump-default-content/logo";
import Link from "next/link";
import useHeaderNavigation from "@/utils/content/use-header-navigation";
import { useUser } from "@supabase/auth-helpers-react";
import useTranslation from "next-translate/useTranslation";

type Props = {
  className?: string;
  onClose?: () => void;
};
const ContentHeaderMobile = ({ className, onClose }: Props) => {
  const navigation = useHeaderNavigation();
  const user = useUser();
  const { t } = useTranslation("content");
  return (
    <div
      className={cx(
        "bg-base-300 md:w-72 flex flex-col justify-between",
        className
      )}
    >
      <div className="grid gap-y-4">
        <div className="flex justify-between items-center px-2 py-4">
          <Link href="/" passHref>
            <Logo size="sm" />
          </Link>
          <Button
            className="md:hidden"
            shape="square"
            color="ghost"
            onClick={onClose}
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
        <Menu>
          {navigation.map((item) => (
            <Menu.Item key={item.title}>
              <Link href={item.href} passHref>
                {item.title}
              </Link>
            </Menu.Item>
          ))}
          <Divider />
          {!!user ? (
            <Menu.Item>
              <Link href="/dashboard" passHref>
                {t("dashboard")}
              </Link>
            </Menu.Item>
          ) : (
            <>
              <Menu.Item>
                <Link href="/login" passHref>
                  {t("login")}
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link href="/signup" passHref>
                  {t("signUp")}
                </Link>
              </Menu.Item>
            </>
          )}
        </Menu>
      </div>
    </div>
  );
};

export default ContentHeaderMobile;
