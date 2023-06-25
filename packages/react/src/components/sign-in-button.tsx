'use client';

import {ComponentPropsWithoutRef, ReactNode} from "react";
import ensureChildComponent from "../utils/ensure-child-component";
import ThemeContainer from "./ui/theme-container";
import {BasePropsWithClient} from "../types/base-props";
import {Dialog, DialogTrigger} from "@radix-ui/react-dialog";
import {DialogContent} from "./ui/dialog";
import BasejumpTheme from "../themes/default-theme";
import {Auth} from "./auth";
import {en, I18nVariables} from "@usebasejump/shared";
import {merge} from "@supabase/auth-ui-shared";

// load props from auth component

type Props = BasePropsWithClient & ComponentPropsWithoutRef<typeof Auth> & {
    children?: ReactNode
}

export const SignInButton = ({
                                 children,
                                 theme = "default",
                                 view = "sign_in",
                                 localization,
                                 appearance = {theme: BasejumpTheme},
                                supabaseClient,
                                 ...props
                             }: Props) => {
    const i18n: I18nVariables = merge(en, localization?.variables ?? {})
    const labels = i18n?.sign_in_button;
    // check if children exists, if not, use default text
    const child = ensureChildComponent(children, labels?.button_label);


    return (
        <>
            <Dialog>
                <DialogTrigger asChild>{child}</DialogTrigger>
                <ThemeContainer appearance={appearance} theme={theme}>
                    <DialogContent appearance={appearance}>
                        <Auth localization={localization} view={view} appearance={appearance} theme={theme}
                              supabaseClient={supabaseClient} {...props} />
                    </DialogContent>
                </ThemeContainer>
            </Dialog>
        </>
    )
}