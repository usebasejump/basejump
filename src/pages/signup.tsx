import SignupPassword from "@/components/dashboard/authentication/signup-password";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

const SignUpPage = () => {
  const { t } = useTranslation("authentication");
  return (
    <div className="max-w-md mx-auto my-12 bg-base-500 grid gap-y-4">
      <SignupPassword />
      <Link href="/login" passHref>
        {t("shared.alreadyRegistered")}
      </Link>
    </div>
  );
};

export default SignUpPage;
