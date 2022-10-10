import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { useForm } from "react-hook-form";
import { Button } from "react-daisyui";
import useTranslation from "next-translate/useTranslation";
import getFullRedirectUrl from "@/utils/get-full-redirect-url";
import Input from "@/components/core/input";
import { toast } from "react-toastify";
import { DASHBOARD_PATH } from "@/types/auth";
import { useRouter } from "next/router";

type LOGIN_FORM = {
  email: string;
  password: string;
};

type Props = {
  redirectTo?: string;
  buttonText?: string;
};

const LoginPassword = ({ redirectTo = DASHBOARD_PATH, buttonText }: Props) => {
  const { t } = useTranslation("authentication");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LOGIN_FORM>();

  async function onSubmit({ email, password }: LOGIN_FORM) {
    const { error, session } = await supabaseClient.auth.signIn(
      { email, password },
      { redirectTo: getFullRedirectUrl(redirectTo) }
    );
    if (error) toast.error(error.message);
    if (!error) {
      await router.push(redirectTo);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <Input
        label={t("shared.email")}
        type="email"
        {...register("email", { required: true })}
      />
      <Input
        label={t("shared.password")}
        type="password"
        {...register("password", { required: true })}
      />
      <Button
        type="submit"
        color="primary"
        disabled={isSubmitting}
        loading={isSubmitting}
      >
        {buttonText || t("loginPassword.buttonText")}
      </Button>
    </form>
  );
};

export default LoginPassword;
