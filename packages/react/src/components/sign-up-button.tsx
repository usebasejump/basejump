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

export const SignUpButton = ({
                                 children,
                                 theme = "default",
                                 view = "sign_up",
                                 appearance = {theme: BasejumpTheme},
                                 localization,
                                 supabaseClient,
                                 ...props
                             }: Props) => {
    const i18n: I18nVariables = merge(en, localization?.variables ?? {})
    const labels = i18n?.sign_up_button;
    // check if children exists, if not, use default text
    const child = ensureChildComponent(children, labels?.button_label);


    return (
        <>
            <Dialog>
                <DialogTrigger asChild>{child}</DialogTrigger>
                <ThemeContainer appearance={appearance} theme={theme}>
                    <DialogContent appearance={appearance}>
                        <Auth view={view} localization={localization} appearance={appearance} theme={theme}
                              supabaseClient={supabaseClient} {...props} />
                    </DialogContent>
                </ThemeContainer>
            </Dialog>
        </>
    )
}