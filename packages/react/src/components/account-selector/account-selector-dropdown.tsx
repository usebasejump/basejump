import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "../ui/command";
import { useAccounts } from "../../api/use-accounts";
import { useBasejumpClient } from "../basejump-user-session";
import { useMemo, useState } from "react";
import {
  CREATE_ACCOUNT_RESPONSE,
  en,
  GET_ACCOUNTS_RESPONSE,
  I18nVariables,
} from "@usebasejump/shared";
import { BasePropsWithoutClient } from "../types/base-props";
import { merge } from "@supabase/auth-ui-shared";
import { css } from "@stitches/core";
import { ChevronsUpDown, PlusCircle } from "lucide-react";
import { Avatar } from "../ui/avatar";
import { AccountSelectorLine } from "./account-selector-line.tsx";
import { CreateAccountButton } from "../create-account-button";

type Props = BasePropsWithoutClient & {
  currentAccountId?: string;
  currentAccountSlug?: string;
  defaultPersonalAccount?: boolean;
  onAccountChange: (account: GET_ACCOUNTS_RESPONSE[0]) => void;
  showEditButton?: boolean;
  afterCreate?: (account: CREATE_ACCOUNT_RESPONSE) => void;
  onEditClick?: (accountId: string) => void;
};

const newTeamContainerStyles = css({
  borderTopWidth: "1px",
  width: "100%",
  padding: "$dropdownItemPadding",
  display: "flex",
  alignItems: "center",
  columnGap: "0.5rem",
});

const selectedItemContainerStyles = css({
  padding: "$dropdownItemPadding",
  paddingTop: 0,
  paddingBottom: 0,
  paddingRight: 0,
  display: "flex",
  alignItems: "center",
  columnGap: "0.5rem",
});

const newTeamIconStyles = css({
  marginRight: "0.5rem",
  height: "1.5rem",
  width: "1.5rem",
  flexShrink: 0,
  opacity: 0.5,
});

export const AccountSelectorDropdown = ({
  currentAccountId,
  currentAccountSlug,
  localization,
  defaultPersonalAccount = true,
  onAccountChange,
  afterCreate,
  showEditButton = true,
  onEditClick,
}: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.account_selector;
  const supabaseClient = useBasejumpClient();

  const { data, refetch } = useAccounts({ supabaseClient });

  const personalAccount = useMemo<GET_ACCOUNTS_RESPONSE[0] | undefined>(() => {
    return data?.find((a) => a.personal_account);
  }, [data]);

  const teamAccounts = useMemo<GET_ACCOUNTS_RESPONSE | undefined>(() => {
    return data?.filter((a) => !a.personal_account);
  }, [data]);

  const currentAccount = useMemo<GET_ACCOUNTS_RESPONSE[0] | undefined>(() => {
    if (currentAccountId) {
      return data?.find((a) => a.id === currentAccountId);
    }

    if (currentAccountSlug) {
      return data?.find((a) => a.slug === currentAccountSlug);
    }

    if (defaultPersonalAccount) {
      return personalAccount;
    }
  }, [
    data,
    currentAccountId,
    currentAccountSlug,
    defaultPersonalAccount,
    personalAccount,
  ]);

  function internalAfterCreate(account: CREATE_ACCOUNT_RESPONSE) {
    refetch();
    if (afterCreate) {
      afterCreate(account);
    }
  }

  function internalOnEditClick(accountId: string) {
    if (onEditClick) {
      onEditClick(accountId);
    }
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div className={selectedItemContainerStyles()}>
          <Avatar
            uniqueId={
              currentAccount?.personal_account
                ? currentAccount?.name || "personal-account"
                : currentAccount?.slug || currentAccount?.id
            }
            size="large"
          />
          {currentAccount?.personal_account
            ? currentAccount?.name || labels?.my_account
            : currentAccount?.name || currentAccount?.slug}
          <ChevronsUpDown className={newTeamIconStyles()} />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Command onKeyDown={() => {}}>
          <CommandInput placeholder={labels?.search_placeholder} />
          <CommandList>
            {personalAccount && (
              <CommandGroup heading={labels?.personal_account}>
                <AccountSelectorLine
                  onSelect={() => onAccountChange(personalAccount)}
                  account={personalAccount}
                  supabaseClient={supabaseClient!}
                  localization={localization}
                  showEditButton={showEditButton}
                />
              </CommandGroup>
            )}
            {teamAccounts?.length > 0 && (
              <CommandGroup heading={labels?.team_accounts}>
                {teamAccounts?.map((account) => (
                  <AccountSelectorLine
                    key={account.account_id}
                    onSelect={() => onAccountChange(account)}
                    account={account}
                    supabaseClient={supabaseClient!}
                    localization={localization}
                    showEditButton={showEditButton}
                    onEditClick={internalOnEditClick}
                  />
                ))}
              </CommandGroup>
            )}
            <CommandEmpty>{labels?.no_results}</CommandEmpty>
          </CommandList>
        </Command>
        <CreateAccountButton
          supabaseClient={supabaseClient!}
          afterCreate={internalAfterCreate}
        >
          <button className={newTeamContainerStyles()}>
            <PlusCircle className={newTeamIconStyles()} />
            {labels?.create_new_team}
          </button>
        </CreateAccountButton>
      </PopoverContent>
    </Popover>
  );
};
