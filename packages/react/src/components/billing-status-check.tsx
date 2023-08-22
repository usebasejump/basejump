"use client";

import { ForwardedRef, forwardRef, ReactNode } from "react";
import ensureChildComponent from "../utils/ensure-child-component";
import ThemeContainer from "./ui/theme-container";
import { BasePropsWithClient } from "../types/base-props";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { DialogContent } from "./ui/dialog";
import BasejumpTheme from "../themes/default-theme";
import { en, I18nVariables } from "@usebasejump/shared";
import { merge } from "@supabase/auth-ui-shared";
import { SubscriptionPlans } from "./subscription-plans.tsx";

// load props from auth component

type Props = BasePropsWithClient & {
  children?: ReactNode;
  accountId?: string;
};

export const NewBillingSubscriptionButton = forwardRef(
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
    }: Props,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const i18n: I18nVariables = merge(en, localization?.variables ?? {});
    const labels = i18n?.new_billing_subscription_button;
    // check if children exists, if not, use default text
    const child = ensureChildComponent(children, labels?.button_label);

    return (
      <Dialog>
        <DialogTrigger asChild>{child}</DialogTrigger>
        <ThemeContainer appearance={appearance} theme={theme}>
          <DialogContent appearance={appearance} size="large">
            <SubscriptionPlans
              appearance={appearance}
              theme={theme}
              supabaseClient={supabaseClient}
              accountId={accountId}
            />
          </DialogContent>
        </ThemeContainer>
      </Dialog>
    );
  }
);

NewBillingSubscriptionButton.displayName = "NewBillingSubscriptionButton";
