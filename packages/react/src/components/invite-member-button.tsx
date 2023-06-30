"use client";

import { ForwardedRef, forwardRef, ReactNode, useState } from "react";
import ensureChildComponent from "../utils/ensure-child-component";
import ThemeContainer from "./ui/theme-container";
import { BasePropsWithClient } from "../types/base-props";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { DialogContent } from "./ui/dialog";
import BasejumpTheme from "../themes/default-theme";
import { en, I18nVariables } from "@usebasejump/shared";
import { merge } from "@supabase/auth-ui-shared";
import { Header1, Text } from "./ui/typography.tsx";
import { InviteMemberForm } from "./forms/invite-member-form.tsx";

// load props from auth component

type Props = BasePropsWithClient & {
  children?: ReactNode;
  accountId: string;
  invitationUrlTemplate?: string;
};

export const InviteMemberButton = forwardRef(
  (
    {
      children,
      invitationUrlTemplate,
      theme = "default",
      localization,
      appearance = { theme: BasejumpTheme },
      supabaseClient,
      accountId,
      ...props
    }: Props,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const [open, setOpen] = useState(false);
    const i18n: I18nVariables = merge(en, localization?.variables ?? {});
    const labels = i18n?.invite_member_button;
    // check if children exists, if not, use default text
    const child = ensureChildComponent(children, labels?.button_label);

    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild ref={ref}>
            {child}
          </DialogTrigger>
          <ThemeContainer appearance={appearance} theme={theme}>
            <DialogContent appearance={appearance}>
              <Header1>{labels?.header_text}</Header1>
              <Text>{labels?.description_text}</Text>
              <InviteMemberForm
                invitationUrlTemplate={invitationUrlTemplate}
                accountId={accountId}
                supabaseClient={supabaseClient}
                appearance={appearance}
                theme={theme}
                localization={localization}
                onCancel={() => setOpen(false)}
              />
            </DialogContent>
          </ThemeContainer>
        </Dialog>
      </>
    );
  }
);

InviteMemberButton.displayName = "InviteMemberButton";
