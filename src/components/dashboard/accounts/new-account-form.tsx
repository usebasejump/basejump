import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Input from "@/components/core/input";
import { Button } from "react-daisyui";
import useTranslation from "next-translate/useTranslation";
import { Database } from "@/types/supabase-types";

type Props = {
  onComplete: (accountId: string) => void;
};

type FORM_DATA = {
  name: string;
};

const NewAccountForm = ({ onComplete }: Props) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient<Database>();
  const { t } = useTranslation("dashboard");
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FORM_DATA>();

  async function onSubmit(data: FORM_DATA) {
    if (!user) return;
    const response = await supabaseClient
      .from("accounts")
      .insert({
        team_name: data.name,
      })
      .select();

    if (response.error) {
      toast.error(response.error.message);
    }

    if (response?.data?.[0]?.id) {
      reset();
      toast.success(t("shared.successfulChange"));
      if (onComplete) {
        onComplete(response.data?.[0]?.id);
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-y-4"
    >
      <Input
        {...register("name", {
          required: t("errors.required"),
        })}
        label={t("newAccount.name")}
        helpText={t("newAccount.nameHelpText")}
        errorMessage={errors?.name?.message}
        data-testid="name"
      />
      <Button type="submit" color="primary" loading={isSubmitting}>
        {t("newAccount.submit")}
      </Button>
    </form>
  );
};

export default NewAccountForm;
