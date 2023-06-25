import { Header1 } from "./ui/typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { EditAccountForm } from "./forms/edit-account-form";
import { Container } from "./ui/container";
import { BasePropsWithClient } from "../types/base-props";
import { ComponentPropsWithoutRef } from "react";
import { Auth } from "./auth";
import BasejumpTheme from "../themes/default-theme";
import { en, I18nVariables } from "@usebasejump/shared";
import { merge } from "@supabase/auth-ui-shared";
import ThemeContainer from "./ui/theme-container";

type Props = BasePropsWithClient &
  ComponentPropsWithoutRef<typeof Auth> & {
    accountId?: string;
    accountSlug?: string;
  };

enum EditAccountTabs {
  general = "general",
  billing = "billing",
  members = "members",
}

export const EditAccountPage = ({
  theme = "default",
  localization,
  appearance = { theme: BasejumpTheme },
  supabaseClient,
  accountId,
  accountSlug,
}: Props) => {
  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.edit_account_button;
  return (
    <ThemeContainer appearance={appearance} theme={theme}>
      <Container direction="vertical" gap="large">
        <Header1>{labels?.header_text}</Header1>
        <div>
          <Tabs>
            <TabsList>
              <TabsTrigger value={EditAccountTabs.general}>
                {labels?.general_tab_label}
              </TabsTrigger>
              <TabsTrigger value={EditAccountTabs.members}>
                {labels?.members_tab_label}
              </TabsTrigger>
              <TabsTrigger value={EditAccountTabs.billing}>
                {labels?.billing_tab_label}
              </TabsTrigger>
            </TabsList>
            <TabsContent value={EditAccountTabs.general}>
              <EditAccountForm
                supabaseClient={supabaseClient}
                accountId={accountId}
                accountSlug={accountSlug}
                appearance={appearance}
                localization={localization}
                theme={theme}
              />
            </TabsContent>
            <TabsContent value={EditAccountTabs.members}>
              {labels?.members_tab_label}
            </TabsContent>
            <TabsContent value={EditAccountTabs.billing}>
              {labels?.billing_tab_label}
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    </ThemeContainer>
  );
};
