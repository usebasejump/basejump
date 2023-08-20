import { Header1, Header3 } from "./ui/typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { EditAccountForm } from "./forms/edit-account-form";
import { Container } from "./ui/container";
import { BasePropsWithClient } from "../types/base-props";
import BasejumpTheme from "../themes/default-theme";
import { en, I18nVariables } from "@usebasejump/shared";
import { merge } from "@supabase/auth-ui-shared";
import ThemeContainer from "./ui/theme-container";
import { AccountMembers } from "./edit-account-page/account-members.tsx";
import { InviteMemberButton } from "./invite-member-button.tsx";
import { Button } from "./ui/button.tsx";
import { useAccount } from "../api/use-account.ts";
import { AccountInvitations } from "./edit-account-page/account-invitations.tsx";
import { AccountBilling } from "./edit-account-page/account-billing.tsx";

type Props = BasePropsWithClient & {
  accountId?: string;
  accountSlug?: string;
  invitationUrlTemplate?: string;
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
  invitationUrlTemplate,
}: Props) => {
  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.edit_account_page;

  const { data: account } = useAccount({
    accountId,
    accountSlug,
    supabaseClient,
  });

  return (
    <ThemeContainer appearance={appearance} theme={theme}>
      <Container direction="vertical" gap="large">
        <div style={{ paddingLeft: "1rem" }}>
          <Header1>{labels?.header_text}</Header1>
        </div>
        <div>
          <Tabs>
            <TabsList>
              <TabsTrigger value={EditAccountTabs.general}>
                {labels?.general_tab_label}
              </TabsTrigger>
              {account?.personal_account === false && (
                <TabsTrigger value={EditAccountTabs.members}>
                  {labels?.members_tab_label}
                </TabsTrigger>
              )}
              {account?.billing_enabled && (
                <TabsTrigger value={EditAccountTabs.billing}>
                  {labels?.billing_tab_label}
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value={EditAccountTabs.general}>
              <EditAccountForm
                supabaseClient={supabaseClient}
                account={account}
                appearance={appearance}
                localization={localization}
                theme={theme}
              />
            </TabsContent>
            {account?.personal_account === false && (
              <TabsContent value={EditAccountTabs.members}>
                <Container direction="vertical" gap="xlarge">
                  <Container direction="inline" position="end">
                    <InviteMemberButton
                      supabaseClient={supabaseClient}
                      accountId={account?.account_id}
                      invitationUrlTemplate={invitationUrlTemplate}
                    >
                      <Button
                        width="auto"
                        appearance={appearance}
                        theme={theme}
                        color="primary"
                      >
                        {labels?.new_member_button_label}
                      </Button>
                    </InviteMemberButton>
                  </Container>
                  <div>
                    <Header3>{labels?.invitations_header_text}</Header3>
                    <AccountInvitations
                      appearance={appearance}
                      localization={localization}
                      theme={theme}
                      supabaseClient={supabaseClient}
                      accountId={accountId}
                    />
                  </div>
                  <div>
                    <Header3>{labels?.members_header_text}</Header3>
                    <AccountMembers
                      appearance={appearance}
                      localization={localization}
                      them={theme}
                      accountId={accountId}
                      supabaseClient={supabaseClient}
                    />
                  </div>
                </Container>
              </TabsContent>
            )}
            {account?.billing_enabled && (
              <TabsContent value={EditAccountTabs.billing}>
                <AccountBilling
                  appearance={appearance}
                  localization={localization}
                  theme={theme}
                  accountId={accountId}
                  supabaseClient={supabaseClient}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </Container>
    </ThemeContainer>
  );
};
