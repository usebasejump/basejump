"use client";

import {
  cloneElement,
  ForwardedRef,
  forwardRef,
  ReactNode,
  useState,
} from "react";
import ensureChildComponent from "../utils/ensure-child-component";
import ThemeContainer from "./ui/theme-container";
import { BasePropsWithClient } from "../types/base-props";
import BasejumpTheme from "../themes/default-theme";
import { en, I18nVariables } from "@usebasejump/shared";
import { merge } from "@supabase/auth-ui-shared";
import { Button } from "./ui/button.tsx";

// load props from auth component

type Props = BasePropsWithClient & {
  children?: ReactNode;
  accountId?: string;
};

export const ManageBillingSubscriptionButton = forwardRef(
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
    const labels = i18n?.manage_billing_subscription_button;
    const [loading, setLoading] = useState(false);

    // check if children exists, if not, use default text
    const child = ensureChildComponent(
      children,
      <Button color="primary" loading={loading} width="auto">
        {labels?.button_label}
      </Button>
    );

    async function handleManagePlan() {
      setLoading(true);
      const { data } = await supabaseClient.functions.invoke(
        "billing-functions",
        {
          body: {
            action: "get_billing_portal_url",
            args: {
              account_id: accountId,
              return_url: window.location.href,
            },
          },
        }
      );

      setLoading(false);

      if (data.url) {
        window.location = data.url;
      }
    }

    return (
      <ThemeContainer appearance={appearance} theme={theme}>
        {cloneElement(child, {
          onClick: handleManagePlan,
          ref: ref,
        })}
      </ThemeContainer>
    );
  }
);

ManageBillingSubscriptionButton.displayName = "ManageBillingSubscriptionButton";
