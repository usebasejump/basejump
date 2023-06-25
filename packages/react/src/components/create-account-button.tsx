"use client";

import { ElementRef, forwardRef, ReactNode, useState } from "react";
import ensureChildComponent from "../utils/ensure-child-component";
import ThemeContainer from "./ui/theme-container";
import { BasePropsWithClient } from "../types/base-props";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import BasejumpTheme from "../themes/default-theme";
import {
  CREATE_ACCOUNT_RESPONSE,
  en,
  I18nVariables,
} from "@usebasejump/shared";
import { merge } from "@supabase/auth-ui-shared";
import { CreateAccountForm } from "./forms/create-account-form";
import { Header1, Text } from "./ui/typography";
import { Container } from "./ui/container";
// load props from auth component

type Props = BasePropsWithClient & {
  children?: ReactNode;
  afterCreate?: (account: CREATE_ACCOUNT_RESPONSE) => void;
};

export const CreateAccountButton = forwardRef<ElementRef<typeof Dialog>, Props>(
  (
    {
      children,
      theme = "default",
      localization,
      appearance = { theme: BasejumpTheme },
      supabaseClient,
      afterCreate,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const i18n: I18nVariables = merge(en, localization?.variables ?? {});
    const labels = i18n?.create_account_button;
    // check if children exists, if not, use default text
    const child = ensureChildComponent(children, labels?.button_label);

    function internalAfterCreate(account: CREATE_ACCOUNT_RESPONSE) {
      setOpen(false);
      if (afterCreate) afterCreate(account);
    }

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild ref={ref}>
          {child}
        </DialogTrigger>
        <ThemeContainer appearance={appearance} theme={theme}>
          <DialogContent appearance={appearance}>
            <Container direction="vertical" gap="medium">
              <Header1>{labels?.header_text}</Header1>
              <Text>{labels?.description_text}</Text>
              <CreateAccountForm
                onCancel={() => setOpen(false)}
                supabaseClient={supabaseClient}
                appearance={appearance}
                theme={theme}
                afterCreate={internalAfterCreate}
                localization={localization}
              />
            </Container>
          </DialogContent>
        </ThemeContainer>
      </Dialog>
    );
  }
);

CreateAccountButton.displayName = "CreateAccountButton";
