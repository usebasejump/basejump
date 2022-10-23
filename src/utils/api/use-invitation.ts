import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import handleSupabaseErrors from "../handle-supabase-errors";
import { Database } from "@/types/supabase-types";

type Invitation = {
  team_name?: string;
  active: boolean;
};
export default function useInvitation(
  invitationToken: string,
  options?: UseQueryOptions<Invitation>
) {
  const user = useUser();
  const supabaseClient = useSupabaseClient<Database>();
  return useQuery<Invitation, Error>(
    ["invitation", invitationToken],
    async () => {
      const { data, error } = await supabaseClient.rpc("lookup_invitation", {
        lookup_invitation_token: invitationToken,
      });
      handleSupabaseErrors(data, error);

      return data as unknown as Invitation;
    },
    {
      ...options,
      enabled:
        Boolean(invitationToken) && Boolean(user) && Boolean(supabaseClient),
    }
  );
}
