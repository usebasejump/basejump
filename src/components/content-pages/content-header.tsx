import { Button, Navbar } from "react-daisyui";
import Link from "next/link";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Logo from "@/components/basejump-default-content/logo";
import useTranslation from "next-translate/useTranslation";

const ContentHeader = () => {
  const { user } = useUser();
  const router = useRouter();

  const { t } = useTranslation("content");

  const navigation = [
    {
      title: t("docs"),
      href: "/docs",
    },
    {
      title: t("blog"),
      href: "/blog",
    },
  ];

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
        {navigation.map((nav) => (
          <Link key={nav.href} href={nav.href} passHref>
            <Button color="ghost">{nav.title}</Button>
          </Link>
        ))}
      </div>
      <div>
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
    </Navbar>
  );
};

export default ContentHeader;
