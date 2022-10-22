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
  const { user } = useUser();
  const router = useRouter();

  const { t } = useTranslation("content");

  const navigation = useHeaderNavigation();

  return (
    <Navbar className="flex justify-between items-center md:px-8 py-4 max-w-screen-xl mx-auto">
      <div className="flex gap-2">
        {router.asPath !== "/" && (
          <Link href="/" passHref>
            <button className="mr-4">
              <Logo size="sm" />
            </button>
          </Link>
        )}
        <div className="hidden lg:flex gap-4">
          {navigation.map((nav) => (
            <Link key={nav.href} href={nav.href} passHref>
              <Button color="ghost">{nav.title}</Button>
            </Link>
          ))}
        </div>
      </div>
      <div className="hidden lg:flex">
        {!!user ? (
          <Link href="/dashboard" passHref>
            <Button color="ghost">{t("dashboard")}</Button>
          </Link>
        ) : (
          <>
            <Link href="/login" passHref>
              <Button color="ghost">{t("login")}</Button>
            </Link>
            <Link href="/signup" passHref>
              <Button color="ghost">{t("signUp")}</Button>
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
