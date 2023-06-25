'use client';

import {ReactNode} from "react";
import {DropdownMenu, DropdownMenuTrigger} from "@radix-ui/react-dropdown-menu";
import ThemeContainer from "./ui/theme-container";
import {BasePropsWithClient} from "../types/base-props";
import {DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator} from "./ui/dropdown-menu";
import {en, I18nVariables} from "@usebasejump/shared";
import {merge} from "@supabase/auth-ui-shared";
import {SupabaseClient} from "@supabase/supabase-js";
import {CreateAccountButton} from "./create-account-button";
import {EditProfileButton} from "./edit-profile-button";
import {Avatar} from "./ui/avatar";

type Props = BasePropsWithClient & {
    children?: ReactNode;
    supabaseClient?: SupabaseClient;
    showProfileLink?: boolean;
    showCreateAccount?: boolean;
}

export const ProfileButton = ({children, appearance, theme, localization, showProfileLink = true, showCreateAccount = true, supabaseClient}: Props) => {

    const i18n: I18nVariables = merge(en, localization?.variables ?? {})
    const labels = i18n?.user_button;

    async function signOut() {
        await supabaseClient?.auth.signOut();
        window.location.reload();
    }

    //TODO: Add support for passing in a current account. Default to personal account if not provided similar to account selector. Use this to add settings / billings / team links to dropdown
    //TODO: Consider adding personal_account_id to the profile response so that we can only call that here and know if we should show links here maybe?

    return (
        <ThemeContainer appearance={appearance} theme={theme}>
                <DropdownMenu>
                    <DropdownMenuTrigger><Avatar uniqueId="personal-account" size="large" /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {showProfileLink && <DropdownMenuItem asChild><EditProfileButton supabaseClient={supabaseClient!}><button style={{width: '100%', height: '100%', padding: '$lin'}}>{labels?.edit_profile}</button></EditProfileButton></DropdownMenuItem>}
                        {showCreateAccount && <DropdownMenuItem asChild><CreateAccountButton supabaseClient={supabaseClient!} /></DropdownMenuItem>}
                        {!!children && (
                            <>
                            <DropdownMenuSeparator />
                                {children}
                            <DropdownMenuSeparator />
                            </>
                            )}
                        <DropdownMenuItem onClick={() => signOut()}>{labels?.sign_out}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
        </ThemeContainer>
    )

}

const UserButtonItem = DropdownMenuItem;

export {UserButtonItem};