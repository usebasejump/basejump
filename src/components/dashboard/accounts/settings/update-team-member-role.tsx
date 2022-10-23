import { useForm } from "react-hook-form";
import { Button, Checkbox } from "react-daisyui";
import useTranslation from "next-translate/useTranslation";
import Select from "@/components/core/select";
import { userTypeOptions } from "@/components/dashboard/accounts/settings/invite-member";
import useTeamRole from "@/utils/api/use-team-role";
import { UseTeamMembersResponse } from "@/utils/api/use-team-members";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "@/types/supabase-types";

type USER_ROLE_FORM = {
  account_role: Database["public"]["Tables"]["account_user"]["Row"]["account_role"];
  make_primary_owner?: boolean;
};

type Props = {
  member: UseTeamMembersResponse;
  onComplete?: () => void;
};

const UpdateTeamMemberRole = ({ member, onComplete }: Props) => {
  const { t } = useTranslation("dashboard");
  const supabaseClient = useSupabaseClient<Database>();
  const { isPrimaryOwner } = useTeamRole(member.account_id);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<USER_ROLE_FORM>({
    defaultValues: {
      account_role: member.account_role,
      make_primary_owner: false,
    },
  });

  async function onSubmit(formData) {
    const { error } = await supabaseClient.rpc("update_account_user_role", {
      account_id: member.account_id,
      user_id: member.user_id,
      new_account_role: formData.account_role,
      make_primary_owner: formData.make_primary_owner,
    });
    if (error) {
      toast.error(error.message);
    }
    await queryClient.invalidateQueries(["teamMembers"]);
    if (onComplete) {
      onComplete();
    }
  }

  const isOwner = watch("account_role") === "owner";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-y-4">
      <Select
        label={t("updateTeamMemberRole.role")}
        {...register("account_role")}
      >
        {userTypeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {isOwner && isPrimaryOwner && (
        <div className="form-control">
          <label className="label">
            {t("updateTeamMemberRole.makePrimaryOwner")}
            <Checkbox {...register("make_primary_owner")} />
          </label>
        </div>
      )}
      <Button
        type="submit"
        color="primary"
        disabled={isSubmitting}
        loading={isSubmitting}
      >
        {t("updateTeamMemberRole.buttonText")}
      </Button>
    </form>
  );
};

export default UpdateTeamMemberRole;
