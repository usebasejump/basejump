import formatDistance from "date-fns/formatDistance";
import { Badge, Button } from "react-daisyui";
import { ClipboardCopyIcon, TrashIcon } from "@heroicons/react/outline";
import useTranslation from "next-translate/useTranslation";
import { useCopyToClipboard } from "react-use";
import getInvitationUrl from "@/utils/get-invitation-url";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "@/types/supabase-types";

type Props = {
  invitation: Database["public"]["Tables"]["invitations"]["Row"];
  onChange?: () => void;
};
const IndividualTeamInvitation = ({ invitation, onChange }: Props) => {
  const { t } = useTranslation("dashboard");
  const supabaseClient = useSupabaseClient<Database>();
  const [state, copyToClipboard] = useCopyToClipboard();

  const deleteInvitation = useMutation(
    async (invitationId: string) => {
      const { data, error } = await supabaseClient
        .from("invitations")
        .delete()
        .match({ id: invitationId });
      if (error) {
        toast.error(error.message);
      }

      return { data, error };
    },
    {
      onSuccess() {
        onChange?.();
      },
    }
  );

  return (
    <div
      key={invitation.id}
      className="grid grid-cols-1 md:grid-cols-2 md:items-center px-6 py-4"
    >
      <div>
        <p className="font-bold px-1 mb-2">
          {t("listTeamInvitations.linkDescription", {
            date: formatDistance(new Date(invitation.created_at), new Date(), {
              addSuffix: true,
            }),
          })}
        </p>
        <div className="flex gap-x-2">
          <Badge
            color={
              invitation.invitation_type === "one-time" ? "warning" : "error"
            }
          >
            {invitation.invitation_type}
          </Badge>
          <Badge>{invitation.account_role}</Badge>
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-2">
        <Button
          color="ghost"
          className="flex items-center gap-x-2"
          onClick={() => copyToClipboard(getInvitationUrl(invitation.token))}
        >
          <ClipboardCopyIcon className="h-5 w-5" />
          {!!state.value ? t("shared.copied") : t("shared.copy")}
        </Button>
        <Button
          variant="outline"
          shape="square"
          color="error"
          className="text-error-content"
          loading={deleteInvitation.isLoading}
          onClick={() => deleteInvitation.mutate(invitation.id)}
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default IndividualTeamInvitation;
