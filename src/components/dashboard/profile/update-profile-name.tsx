import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useForm } from "react-hook-form";
import useUserProfile from "@/utils/api/use-user-profile";
import SettingsCard from "@/components/dashboard/shared/settings-card";
import useTranslation from "next-translate/useTranslation";
import { Button } from "react-daisyui";
import Input from "@/components/core/input";
import { toast } from "react-toastify";
import { Database } from "@/types/supabase-types";

type FORM_DATA = {
  name: string;
};

const UpdateProfileName = () => {
  const user = useUser();
  const supabaseClient = useSupabaseClient<Database>();
  const { data: profile } = useUserProfile();
  const { t } = useTranslation("dashboard");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FORM_DATA>();

  async function onSubmit(data: FORM_DATA) {
    if (!user) return;
    const response = await supabaseClient
      .from("profiles")
      .update({
        name: data.name,
      })
      .eq("id", user.id);

    if (response.error) {
      toast.error(response.error.message);
    }

    if (!!data) {
      toast.success(t("shared.successfulChange"));
    }
  }

  return (
    <SettingsCard
      title={t("updateProfileName.yourInformation")}
      description={t("updateProfileName.description")}
    >
      {!!profile && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <SettingsCard.Body>
            <Input
              {...register("name", {
                required: t("errors.required"),
              })}
              label={t("updateProfileName.yourName")}
              errorMessage={errors?.name?.message}
              data-testid="name"
              defaultValue={profile.name}
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

export default UpdateProfileName;
