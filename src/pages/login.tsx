import LoginPassword from "@/components/dashboard/authentication/login-password";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useRouter } from "next/router";
import useAuthCheck from "@/utils/use-auth-check";

const LoginPage = () => {
  const { t } = useTranslation("authentication");
  const router = useRouter();
  const { redirectedFrom } = router.query;

  useAuthCheck(redirectedFrom as string);

  return (
    <div className="max-w-md mx-4 md:mx-auto my-12 bg-base-500 grid gap-y-4">
      <LoginPassword />
      <Link href="/signup" passHref>
        {t("shared.notYetRegistered")}
      </Link>
    </div>
  );
};

export default LoginPage;
