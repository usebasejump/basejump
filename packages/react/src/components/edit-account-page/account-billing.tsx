import { BasePropsWithClient } from "../../types/base-props.ts";
import { en, I18nVariables } from "@usebasejump/shared";
import { merge } from "@supabase/auth-ui-shared";
import ThemeContainer from "../ui/theme-container.tsx";
import { useAccountBillingStatus } from "../../api/use-account-billing-status.ts";
import { Container } from "../ui/container.tsx";
import { Text } from "../ui/typography.tsx";
import { ACCOUNT_ROLES } from "../../types/accounts.ts";
import { Button } from "../ui/button.tsx";
import { NewBillingSubscriptionButton } from "../new-billing-subscription-button.tsx";
import { ManageBillingSubscriptionButton } from "../manage-billing-subscription-button.tsx";

type Props = BasePropsWithClient & {
  accountId: string;
};

export function AccountBilling({
  accountId,
  supabaseClient,
  localization = { variables: {} },
  appearance,
  theme,
}: Props) {
  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.account_billing;

  const { data } = useAccountBillingStatus({
    accountId,
    supabaseClient,
  });

  return (
    <ThemeContainer appearance={appearance} theme={theme}>
      {!!data && (
        <Container gap="large" direction="vertical">
          <div>
            <Text>{labels?.billing_status_label}</Text>
            <p>
              {data?.status ? data.status : labels?.billing_status_not_setup}
            </p>
          </div>
          <div>
            <Text>{labels?.billing_email_label}</Text>
            <p>{data?.billing_email}</p>
          </div>
          {data?.account_role === ACCOUNT_ROLES.owner && (
            <div>
              {data?.status ? (
                <ManageBillingSubscriptionButton
                  supabaseClient={supabaseClient}
                  accountId={accountId}
                />
              ) : (
                <NewBillingSubscriptionButton
                  supabaseClient={supabaseClient}
                  accountId={accountId}
                >
                  <Button width="auto" color="primary">
                    {labels?.setup_new_subscription}
                  </Button>
                </NewBillingSubscriptionButton>
              )}
            </div>
          )}
        </Container>
      )}
    </ThemeContainer>
  );
}
