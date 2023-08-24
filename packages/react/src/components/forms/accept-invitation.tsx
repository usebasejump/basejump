"use client";
import {
  ACCEPT_INVITATION_RESPONSE,
  en,
  I18nVariables,
} from "@usebasejump/shared";
import { useState } from "react";
import { Container } from "../ui/container";
import { Button } from "../ui/button";
import ThemeContainer from "../ui/theme-container";
import { BasePropsWithClient } from "../../types/base-props";
import { merge } from "@supabase/auth-ui-shared";
import { Header1, Text } from "../ui/typography.tsx";
import { useAccountInvitationLookup } from "../../api/use-account-invitation-lookup.ts";
import ErrorMessage from "../ui/error-message.tsx";

interface Props extends BasePropsWithClient {
  afterAccepted?: (account: ACCEPT_INVITATION_RESPONSE) => void;
  token?: string;
}

export const AcceptInvitation = ({
  afterAccepted,
  localization,
  token,
  appearance,
  theme = "default",
  supabaseClient,
}: Props) => {
  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.accept_invitation;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();

  const { data, isLoading } = useAccountInvitationLookup({
    token,
    supabaseClient,
  });

  async function onSubmit() {
    setLoading(true);
    try {
      if (!token) {
        setError(labels?.missing_fields_error);
        return;
      }

      const { data, error } = await supabaseClient.rpc("accept_invitation", {
        lookup_invitation_token: token,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (afterAccepted) {
        afterAccepted(data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemeContainer appearance={appearance} theme={theme}>
      <Container direction={"vertical"} gap="large" appearance={appearance}>
        {isLoading ? (
          <Text>{labels?.loading_label}</Text>
        ) : data?.active ? (
          <>
            <Text>{labels?.header_text}</Text>
            <Header1>{data?.account_name}</Header1>
            {!!error && <ErrorMessage error={error} />}
            <Button
              type="submit"
              color="primary"
              width="auto"
              loading={loading}
              appearance={appearance}
              onClick={onSubmit}
            >
              {loading ? labels?.loading_button_label : labels?.button_label}
            </Button>
          </>
        ) : (
          <Text>{labels?.invalid_invite}</Text>
        )}
      </Container>
    </ThemeContainer>
  );
};
