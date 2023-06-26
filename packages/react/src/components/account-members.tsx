import { BasePropsWithClient } from "../types/base-props.ts";
import { useAccountMembers } from "../api/use-account-members.ts";

type Props = BasePropsWithClient & {
  accountId: string;
};

export function AccountMembers({ accountId, supabaseClient }) {
  const {
    data: members,
    error,
    loading,
  } = useAccountMembers({ accountId, supabaseClient });

  return (
    <table>
      <thead>
        <tr>
          <th>Member</th>
          <th width="0" />
        </tr>
      </thead>
      <tbody>
        {members?.map((member) => (
          <tr key={member.user_id}>
            <td>
              <p>{member.name}</p>
              <p>{member.account_role}</p>
            </td>
            <td>
              <button>Remove</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
