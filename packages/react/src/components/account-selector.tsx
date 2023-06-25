import {
  CREATE_ACCOUNT_RESPONSE,
  GET_ACCOUNTS_RESPONSE,
} from "@usebasejump/shared";
import { BasePropsWithoutClient } from "../types/base-props";
import { AccountSelectorDropdown } from "./account-selector/account-selector-dropdown.tsx";
import { Dialog, DialogContent } from "./ui/dialog";
import ThemeContainer from "./ui/theme-container";
import { EditAccountPage } from "./edit-account-page";
import { useBasejumpClient } from "./basejump-user-session";
import { useState } from "react";

type Props = BasePropsWithoutClient & {
  currentAccountId?: string;
  currentAccountSlug?: string;
  defaultPersonalAccount?: boolean;
  onAccountChange: (account: GET_ACCOUNTS_RESPONSE[0]) => void;
  showEditButton?: boolean;
  afterCreate?: (account: CREATE_ACCOUNT_RESPONSE) => void;
};

export const AccountSelector = ({
  appearance,
  theme,
  localization,
  ...props
}: Props) => {
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  const supabaseClient = useBasejumpClient();

  //TODO: Consider pulling edit account modal out of popover and closing the popover when it opens
  // that would avoid the command from capturing all keyboard events and making it go wonky

  function toggleEditingAccount(accountId: string) {
    console.log("wooooooo", accountId);
    if (editingAccountId === accountId) {
      setEditingAccountId(null);
    } else {
      setEditingAccountId(accountId);
    }
  }

  function toggleOpen(value: boolean) {
    if (value === false) {
      setEditingAccountId(null);
    }
  }

  return (
    <ThemeContainer appearance={appearance} theme={theme}>
      <AccountSelectorDropdown
        appearance={appearance}
        localization={localization}
        onEditClick={toggleEditingAccount}
        theme={theme}
        {...props}
      />
      <Dialog open={!!editingAccountId} onOpenChange={toggleOpen}>
        <DialogContent appearance={appearance} size="large">
          <EditAccountPage
            supabaseClient={supabaseClient}
            accountId={editingAccountId}
            appearance={appearance}
            localization={localization}
            theme={theme}
          />
        </DialogContent>
      </Dialog>
    </ThemeContainer>
  );
};
