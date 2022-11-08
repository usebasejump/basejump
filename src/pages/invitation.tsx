import { useRouter } from "next/router";
import useInvitation from "@/utils/api/use-invitation";
import useTranslation from "next-translate/useTranslation";
import { Button } from "react-daisyui";
import { useMutation } from "@tanstack/react-query";
import handleSupabaseErrors from "@/utils/handle-supabase-errors";
import Loader from "@/components/core/loader";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "@/types/supabase-types";

const Invitation = () => {
  const router = useRouter();
  const { token } = router.query;
  const { t } = useTranslation("dashboard");
  const supabaseClient = useSupabaseClient<Database>();

  const { data, isLoading } = useInvitation(token as string);

  const acceptInvitation = useMutation(
    async (invitationToken: string) => {
      const { data, error } = await supabaseClient.rpc("accept_invitation", {
        lookup_invitation_token: invitationToken,
      });

      handleSupabaseErrors(data, error);
      return data;
    },
    {
      onSuccess(accountId) {
        router.push(`/dashboard/teams/${accountId}`);
      },
    }
  );

  return (
    <div className="max-w-md mx-auto my-12 bg-base-500 grid gap-y-4">
      {isLoading ? (
        <Loader className="mx-auto my-8 h-8" />
      ) : !data?.active ? (
        <h3 className="h4 text-center my-8">{t("invitation.invalid")}</h3>
      ) : (
        <>
          <h3 className="h4 text-center mb-0">{t("invitation.title")}</h3>
          <h1 className="h1 text-center mt-0 mb-8">{data?.team_name}</h1>
          <Button
            color="primary"
            loading={acceptInvitation.isLoading}
            onClick={() => acceptInvitation.mutate(token as string)}
          >
            {t("invitation.accept")}
          </Button>
        </>
      )}
    </div>
  );
};

export default Invitation;
