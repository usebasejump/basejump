"use client";

import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  ReactNode,
} from "react";
import ensureChildComponent from "../utils/ensure-child-component";
import ThemeContainer from "./ui/theme-container";
import { BasePropsWithClient } from "../types/base-props";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { DialogContent } from "./ui/dialog";
import BasejumpTheme from "../themes/default-theme";
import { Auth } from "./auth";
import { en, I18nVariables } from "@usebasejump/shared";
import { merge } from "@supabase/auth-ui-shared";

// load props from auth component

type Props = BasePropsWithClient &
  ComponentPropsWithoutRef<typeof Auth> & {
    children?: ReactNode;
    accountId?: string;
    accountSlug?: string;
  };

//TODO: Kill off this component and instead use the personal_account accounts as our concept of a profile.  it's silly not to
// but will require removing the ability to disable personal accounts - instead remove BILLING on personal accounts

export const EditProfileButton = forwardRef<ElementRef<typeof Dialog>, Props>(
  (
    {
      children,
      theme = "default",
      localization,
      appearance = { theme: BasejumpTheme },
      supabaseClient,
      accountId,
      accountSlug,
      ...props
    },
    ref
  ) => {
    const i18n: I18nVariables = merge(en, localization?.variables ?? {});
    const labels = i18n?.edit_profile_button;
    // check if children exists, if not, use default text
    const child = ensureChildComponent(children, labels?.button_label);

    return (
      <Dialog>
        <DialogTrigger asChild ref={ref}>
          {child}
        </DialogTrigger>
        <ThemeContainer appearance={appearance} theme={theme}>
          <DialogContent appearance={appearance} size="large">
            {labels?.button_label}
          </DialogContent>
        </ThemeContainer>
      </Dialog>
    );
  }
);

EditProfileButton.displayName = "EditProfileButton";
