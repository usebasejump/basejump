"use client";

import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import ThemeContainer from "./ui/theme-container";
import { BasePropsWithClient } from "../types/base-props";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { en, I18nVariables } from "@usebasejump/shared";
import { merge } from "@supabase/auth-ui-shared";
import { SupabaseClient } from "@supabase/supabase-js";
import { CreateAccountButton } from "./create-account-button";
import { Avatar } from "./ui/avatar";
import { usePersonalAccount } from "../api/use-personal-account.ts";
import { EditAccountButton } from "./edit-account-button.tsx";

type Props = BasePropsWithClient & {
  children?: ReactNode;
  supabaseClient?: SupabaseClient;
  showPersonalAccountLink?: boolean;
  showCreateTeamAccountLink?: boolean;
};

const ProfileButton = ({
  children,
  appearance,
  theme,
  localization,
  showPersonalAccountLink = true,
  showCreateTeamAccountLink = true,
  supabaseClient,
}: Props) => {
  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.user_button;

  const { data: profile } = usePersonalAccount({ supabaseClient });

  async function signOut() {
    await supabaseClient?.auth.signOut();
    window.location.reload();
  }

  //TODO: Add support for passing in a current account. Default to personal account if not provided similar to account selector. Use this to add settings / billings / team links to dropdown
  //TODO: Consider adding personal_account_id to the profile response so that we can only call that here and know if we should show links here maybe?

  return (
    <ThemeContainer appearance={appearance} theme={theme}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar uniqueId={profile?.account_id} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {showPersonalAccountLink && (
            <DropdownMenuItem asChild>
              <EditAccountButton
                accountId={profile?.account_id}
                supabaseClient={supabaseClient!}
              >
                <button
                  style={{ width: "100%", height: "100%", textAlign: "left" }}
                >
                  {labels?.edit_profile}
                </button>
              </EditAccountButton>
            </DropdownMenuItem>
          )}
          {showCreateTeamAccountLink && (
            <DropdownMenuItem asChild>
              <CreateAccountButton supabaseClient={supabaseClient!} />
            </DropdownMenuItem>
          )}
          {!!children && (
            <>
              <DropdownMenuSeparator />
              {children}
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => signOut()}>
            {labels?.sign_out}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ThemeContainer>
  );
};

const ProfileButtonItem = DropdownMenuItem;

export { ProfileButton, ProfileButtonItem };
