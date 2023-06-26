import { BasePropsWithClient } from "../../types/base-props.ts";
import { useAccountMembers } from "../../api/use-account-members.ts";
import { en, I18nVariables } from "@usebasejump/shared";
import { merge } from "@supabase/auth-ui-shared";
import { Table } from "../ui/table.tsx";
import { Header3, Text } from "../ui/typography.tsx";
import { IndividualAccountMemberDropdown } from "./individual-account-member-dropdown.tsx";
import ThemeContainer from "../ui/theme-container.tsx";

type Props = BasePropsWithClient & {
  accountId: string;
};

export function AccountMembers({
  accountId,
  supabaseClient,
  localization = { variables: {} },
  appearance,
  theme,
}: Props) {
  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.account_members;

  const {
    data: members,
    error,
    loading,
  } = useAccountMembers({ accountId, supabaseClient });

  return (
    <ThemeContainer appearance={appearance} theme={theme}>
      <Table>
        <thead>
          <tr>
            <th>{labels?.member_label}</th>
            <th>{labels?.role_label}</th>
            <th width={0} />
          </tr>
        </thead>
        <tbody>
          {members?.map((member) => (
            <tr key={member.user_id}>
              <td>
                <Header3>{member.name}</Header3>
                <Text>{member.email}</Text>
              </td>
              <td>
                {member.is_primary_owner
                  ? labels?.primary_owner_label
                  : member.account_role}
              </td>
              <td style={{ textAlign: "right" }}>
                <IndividualAccountMemberDropdown
                  accountId={accountId}
                  member={member}
                  supabaseClient={supabaseClient}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ThemeContainer>
  );
}
