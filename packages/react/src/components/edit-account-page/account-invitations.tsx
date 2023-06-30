import { BasePropsWithClient } from "../../types/base-props.ts";
import { en, I18nVariables } from "@usebasejump/shared";
import { merge } from "@supabase/auth-ui-shared";
import { Table } from "../ui/table.tsx";
import ThemeContainer from "../ui/theme-container.tsx";
import { useAccountInvitations } from "../../api/use-account-invitations.ts";
import { TrashIcon } from "lucide-react";

type Props = BasePropsWithClient & {
  accountId: string;
};

export function AccountInvitations({
  accountId,
  supabaseClient,
  localization = { variables: {} },
  appearance,
  theme,
}: Props) {
  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.account_invitations;
  const roleLabels = i18n?.account_roles;

  const {
    data: invitations,
    error,
    loading,
  } = useAccountInvitations({ accountId, supabaseClient });

  return (
    <ThemeContainer appearance={appearance} theme={theme}>
      <Table>
        <thead>
          <tr>
            <th>{labels?.invitation_type_label}</th>
            <th>{labels?.role_label}</th>
            <th width={0} />
          </tr>
        </thead>
        <tbody>
          {invitations?.map((invitation) => (
            <tr key={`invitation-${invitation.created_at}`}>
              <td>
                <p>
                  {labels?.[`invitation_type_${invitation.invitation_type}`]}
                </p>
              </td>
              <td>{roleLabels?.[invitation.account_role]}</td>
              <td style={{ textAlign: "right" }}>
                <TrashIcon style={{ width: "1rem", height: "1rem" }} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ThemeContainer>
  );
}
