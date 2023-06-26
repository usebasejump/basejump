import { Avatar } from "../ui/avatar";
import { SettingsIcon } from "lucide-react";
import { css } from "@stitches/core";
import { en, GET_ACCOUNTS_RESPONSE, I18nVariables } from "@usebasejump/shared";
import { BasePropsWithClient } from "../../types/base-props";
import { merge } from "@supabase/auth-ui-shared";
import { CommandItem } from "../ui/command";

const lineItemContainerStyles = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
});

const lineItemButtonStyles = css({
  padding: "$dropdownItemPadding",
  display: "flex",
  alignItems: "center",
  columnGap: "0.5rem",
  flexGrow: 1,
  cursor: "pointer",
  "&[aria-selected='true']": {
    backgroundColor: "$dropdownItemHoverBackground",
  },
});

const iconStyles = css({
  height: "1.25rem",
  width: "1.25rem",
  marginLeft: "1rem",
  marginRight: "1rem",
  flexShrink: 0,
  opacity: 0.5,
  "&:hover": {
    opacity: 1,
  },
});

type Props = BasePropsWithClient & {
  account: GET_ACCOUNTS_RESPONSE[0];
  showEditButton?: boolean;
  onSelect: () => void;
  onEditClick?: (accountId: string) => void;
};
export const AccountSelectorLine = ({
  localization,
  account,
  showEditButton = true,
  onSelect,
  onEditClick,
}: Props) => {
  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.account_selector;
  return (
    <div className={lineItemContainerStyles()}>
      <CommandItem className={lineItemButtonStyles()} onSelect={onSelect}>
        <Avatar
          uniqueId={
            account?.personal_account
              ? "personal-account"
              : account.slug || account.id
          }
        />
        {account?.personal_account ? labels?.my_account : account?.name}
      </CommandItem>
      {showEditButton && (
        <button
          style={{ height: "100%" }}
          onClick={() => onEditClick?.(account.account_id)}
        >
          <SettingsIcon className={iconStyles()} />
        </button>
      )}
    </div>
  );
};
