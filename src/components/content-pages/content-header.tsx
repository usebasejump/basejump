import { Button, Navbar } from "react-daisyui";
import Link from "next/link";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Logo from "@/components/basejump-default-content/logo";
import useTranslation from "next-translate/useTranslation";
import { MenuIcon } from "@heroicons/react/outline";
import useHeaderNavigation from "@/utils/content/use-header-navigation";

type Props = {
  toggleSidebar: () => void;
};

const ContentHeader = ({ toggleSidebar }: Props) => {
  const user = useUser();
  const router = useRouter();

  const { t } = useTranslation("content");

  const navigation = useHeaderNavigation();

  return (
    <Navbar className="flex justify-between items-center md:px-8 py-4 max-w-screen-xl mx-auto">
      <div className="flex gap-2">
        {router.asPath !== "/" && (
          <Link href="/" passHref className="mr-4 cursor-pointer">
            <Logo size="sm" />
          </Link>
        )}
        <div className="hidden lg:flex gap-4">
          {navigation.map((nav) => (
            <Link
              key={nav.href}
              href={nav.href}
              passHref
              className="btn btn-ghost"
            >
              {nav.title}
            </Link>
          ))}
        </div>
      </div>
      <div className="hidden lg:flex">
        {!!user ? (
          <Link href="/dashboard" passHref className="btn btn-ghost">
            {t("dashboard")}
          </Link>
        ) : (
          <>
            <Link href="/login" passHref className="btn btn-ghost">
              {t("login")}
            </Link>
            <Link href="/signup" passHref className="btn btn-ghost">
              {t("signUp")}
            </Link>
          </>
        )}
      </div>
      <div className="block lg:hidden">
        <Button color="ghost" onClick={toggleSidebar}>
          <MenuIcon className="w-6 h-6" />
        </Button>
      </div>
    </Navbar>
  );
};

export default ContentHeader;
