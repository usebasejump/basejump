import { useForm } from "react-hook-form";
import handleSupabaseErrors from "@/utils/handle-supabase-errors";
import { Alert, Button } from "react-daisyui";
import useTranslation from "next-translate/useTranslation";
import Select from "@/components/core/select";
import { useState } from "react";
import getInvitationUrl from "@/utils/get-invitation-url";
import { useCopyToClipboard } from "react-use";
import { ClipboardCopyIcon } from "@heroicons/react/outline";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Database } from "@/types/supabase-types";

type Props = {
  accountId: string;
  onComplete?: () => void;
};

type INVITE_FORM = {
  invitationType: "one-time" | "24-hour";
  email: string;
  userType: Database["public"]["Tables"]["invitations"]["Row"]["account_role"];
};

type INVITE_FORM_USER_TYPES = Array<{
  value: Database["public"]["Tables"]["invitations"]["Row"]["account_role"];
  label: string;
}>;

export const userTypeOptions: INVITE_FORM_USER_TYPES = [
  {
    label: "Owner",
    value: "owner",
  },
  {
    label: "Member",
    value: "member",
  },
];

const invitationTypes = [
  {
    label: "One-time link",
    value: "one-time",
  },
  {
    label: "24 hour link",
    value: "24-hour",
  },
];

const defaultInvitationType = "one-time";

const InviteMember = ({ accountId, onComplete }: Props) => {
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [state, copyToClipboard] = useCopyToClipboard();
  const { t } = useTranslation("dashboard");
  const user = useUser();
  const supabaseClient = useSupabaseClient<Database>();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<INVITE_FORM>();

  async function onSubmit(invitation: INVITE_FORM) {
    const { data, error } = await supabaseClient
      .from("invitations")
      .insert({
        invitation_type: invitation.invitationType,
        invited_by_user_id: user.id,
        account_id: accountId,
        account_role: invitation.userType,
      })
      .select();

    handleSupabaseErrors(data, error);

    if (data) {
      setInvitationLink(getInvitationUrl(data?.[0]?.token));
    }

    if (!error && onComplete) {
      onComplete();
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full grid grid-cols-1 md:grid-cols-4 mb-6 gap-2 items-end">
          <Select
            defaultValue={defaultInvitationType}
            label={t("inviteMember.inviteType")}
            {...register("invitationType")}
          >
            {invitationTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          <Select
            label={t("inviteMember.userType")}
            defaultValue="member"
            {...register("userType", { required: true })}
          >
            {userTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          <Button loading={isSubmitting} type="submit">
            {t("inviteMember.linkButton")}
          </Button>
        </div>
      </form>
      {!!invitationLink && (
        <Alert status="success" className="mb-4">
          <div className="flex justify-between items-center w-full px-2">
            <p>{t("inviteMember.linkGenerated")}</p>
            <Button
              className="flex items-center gap-x-2"
              color="ghost"
              onClick={() => copyToClipboard(invitationLink)}
            >
              <ClipboardCopyIcon className="w-5 h-5" />
              {!!state.value ? t("shared.copied") : t("shared.copy")}
            </Button>
          </div>
        </Alert>
      )}
    </>
  );
};

export default InviteMember;
