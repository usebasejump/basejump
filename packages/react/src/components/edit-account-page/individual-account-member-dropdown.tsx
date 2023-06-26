import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { BasePropsWithClient } from "../../types/base-props.ts";
import {
  en,
  GET_ACCOUNT_MEMBERS_RESPONSE,
  I18nVariables,
} from "@usebasejump/shared";
import { merge } from "@supabase/auth-ui-shared";
import { useState } from "react";
import { UpdateMemberRole } from "./update-member-role.tsx";

type Props = BasePropsWithClient & {
  accountId: string;
  member: GET_ACCOUNT_MEMBERS_RESPONSE[];
  onUpdate: () => void;
  onRemove: () => void;
};

export const IndividualAccountMemberDropdown = ({
  accountId,
  member,
  onUpdate,
  onRemove,
  supabaseClient,
  localization = { variables: {} },
}: Props) => {
  const [changeRoleOpen, setChangeRoleOpen] = useState<boolean>(false);
  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.account_members;
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreHorizontal style={{ width: "1.25rem", height: "1.25rem" }} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setChangeRoleOpen(true)}>
            {labels?.change_role}
          </DropdownMenuItem>
          <DropdownMenuItem>{labels?.remove_member}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpdateMemberRole
        supabaseClient={supabaseClient}
        member={member}
        onUpdate={() => alert("updated!")}
        open={changeRoleOpen}
        onOpenChange={setChangeRoleOpen}
      />
    </>
  );
};
