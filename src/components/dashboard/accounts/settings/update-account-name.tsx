import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useForm } from "react-hook-form";
import SettingsCard from "@/components/dashboard/shared/settings-card";
import useTranslation from "next-translate/useTranslation";
import { Button } from "react-daisyui";
import Input from "@/components/core/input";
import { toast } from "react-toastify";
import useTeamAccount from "@/utils/api/use-team-account";
import { Database } from "@/types/supabase-types";

type FORM_DATA = {
  name: string;
};

type Props = {
  accountId: string;
};

const UpdateAccountName = ({ accountId }: Props) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient<Database>();
  const { data } = useTeamAccount(accountId);
  const { t } = useTranslation("dashboard");
  const {
    register,
    handleSubmit,

    formState: { isSubmitting, errors },
  } = useForm<FORM_DATA>();

  async function onSubmit(data: FORM_DATA) {
    if (!user || !accountId) return;
    const response = await supabaseClient
      .from("accounts")
      .update({
        team_name: data.name,
      })
      .match({ id: accountId });
    if (response.error) {
      toast.error(response.error.message || response.statusText);
    }

    if (!!response.data) {
      toast.success(t("shared.successfulChange"));
    }
  }

  return (
    <SettingsCard
      title={t("updateAccountName.title")}
      description={t("updateAccountName.description")}
    >
      {!!data && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <SettingsCard.Body>
            <Input
              {...register("name", {
                required: t("errors.required"),
              })}
              label={t("updateAccountName.teamName")}
              errorMessage={errors?.name?.message}
              data-testid="name"
              defaultValue={data.team_name}
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

export default UpdateAccountName;
