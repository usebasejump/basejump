import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useForm } from "react-hook-form";
import SettingsCard from "@/components/dashboard/shared/settings-card";
import useTranslation from "next-translate/useTranslation";
import { Button } from "react-daisyui";
import Input from "@/components/core/input";
import { toast } from "react-toastify";
import { Database } from "@/types/supabase-types";

type FORM_DATA = {
  email: string;
};

const UpdateEmailAddress = () => {
  const user = useUser();
  const supabaseClient = useSupabaseClient<Database>();
  const { t } = useTranslation("dashboard");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FORM_DATA>();

  async function onSubmit(newEmail: FORM_DATA) {
    if (!user) return;
    const { data, error } = await supabaseClient.auth.updateUser({
      email: newEmail.email,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!!data?.user?.new_email) {
      toast.success(t("updateEmailAddress.successfulChange"));
    }
  }

  return (
    <SettingsCard
      title={t("updateEmailAddress.title")}
      description={t("updateEmailAddress.description")}
    >
      {!!user && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <SettingsCard.Body>
            <Input
              {...register("email", { required: t("errors.required") })}
              label={t("updateEmailAddress.emailAddress")}
              errorMessage={errors?.email?.message}
              data-testid="email"
              defaultValue={user.email}
            />
          </SettingsCard.Body>
          <SettingsCard.Footer>
            <Button type="submit" color="primary" loading={isSubmitting}>
              {t("shared.save")}
            </Button>
          </SettingsCard.Footer>
        </form>
      )}
    </SettingsCard>
  );
};

export default UpdateEmailAddress;
