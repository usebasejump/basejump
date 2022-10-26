import LoginPassword from "@/components/dashboard/authentication/login-password";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";

const LoginPage = () => {
  const { t } = useTranslation("authentication");
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
