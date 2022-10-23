import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input } from "react-daisyui";
import useTranslation from "next-translate/useTranslation";
import getFullRedirectUrl from "@/utils/get-full-redirect-url";
import { DASHBOARD_PATH } from "@/types/auth";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "@/types/supabase-types";

type LOGIN_FORM = {
  email: string;
};

type Props = {
  redirectTo?: string;
  buttonText?: string;
};

const LoginMagicLink = ({ redirectTo = DASHBOARD_PATH, buttonText }: Props) => {
  const { t } = useTranslation("authentication");
  const supabaseClient = useSupabaseClient<Database>();
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LOGIN_FORM>();

  async function onSubmit({ email }: LOGIN_FORM) {
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: getFullRedirectUrl(redirectTo),
      },
    });
    if (error) throw error;
    setEmailSent(true);
  }

  return (
    <>
      {emailSent ? (
        <div className="border p-4 flex justify-between items-center">
          <p>{t("magicLink.checkEmail")}</p>
          <Button color="ghost" size="sm" onClick={() => setEmailSent(false)}>
            {t("magicLink.tryAgain")}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="form-control">
            <label className="label">{t("shared.email")}</label>
            <Input
              type="email"
              placeholder={t("magicLink.emailPlaceholder")}
              {...register("email", { required: true })}
            />
            <label className="label">
              <p className="label-text-alt">{t("magicLink.emailHelpText")}</p>
            </label>
          </div>
          <Button
            type="submit"
            color="primary"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {buttonText || t("magicLink.buttonText")}
          </Button>
        </form>
      )}
    </>
  );
};

export default LoginMagicLink;
