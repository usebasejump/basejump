"use client";
import {
  BASEJUMP_DATABASE,
  CREATE_INVITATION_RESPONSE,
  en,
  I18nVariables,
} from "@usebasejump/shared";
import { FormEvent, useState } from "react";
import { Container } from "../ui/container";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import ErrorMessage from "../ui/error-message";
import ThemeContainer from "../ui/theme-container";
import { BasePropsWithClient } from "../../types/base-props";
import { merge } from "@supabase/auth-ui-shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select.tsx";
import { CopyButton } from "../ui/copy-button.tsx";

export type INVITATION_FORM_DATA = {
  role?: BASEJUMP_DATABASE["public"]["Enums"]["account_role"];
  invitationType?: BASEJUMP_DATABASE["public"]["Enums"]["invitation_type"];
};

interface Props extends BasePropsWithClient {
  accountId: string;
  invitationUrlTemplate: string;
  afterSave?: (account: CREATE_INVITATION_RESPONSE) => void;
  onCancel?: () => void;
  initialData?: INVITATION_FORM_DATA;
}

export const InviteMemberForm = ({
  accountId,
  afterSave,
  onCancel,
  invitationUrlTemplate,
  localization = { variables: {} },
  initialData = { role: "member", invitationType: "one_time" },
  appearance,
  theme = "default",
  supabaseClient,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();
  const [formData, setFormData] = useState<INVITATION_FORM_DATA>(initialData);
  const [inviteLink, setInviteLink] = useState<string>();

  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.invite_member_form;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const { data: responseData, error: responseError } =
        await supabaseClient.rpc("create_invitation", {
          account_id: accountId,
          account_role: formData.role,
          invitation_type: formData.invitationType,
        });

      if (responseError) {
        setError(responseError.message);
        return;
      }

      if (!invitationUrlTemplate) {
        throw new Error("No invitation url template provided");
      }

      setInviteLink(
        invitationUrlTemplate?.replace("{TOKEN}", responseData?.token)
      );

      if (afterSave) {
        afterSave(responseData);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const accountRoleOptions = [
    {
      label: i18n?.account_roles?.member,
      value: "member",
    },
    {
      label: i18n?.account_roles?.owner,
      value: "owner",
    },
  ];

  const linkTypeOptions = [
    {
      label: labels?.single_use_invitation,
      value: "one_time",
    },
    {
      label: labels?.multi_use_invitation,
      value: "24_hour",
    },
  ];

  return (
    <ThemeContainer appearance={appearance} theme={theme}>
      {!!inviteLink ? (
        <Container direction={"vertical"} gap="large" appearance={appearance}>
          <CopyButton text={inviteLink} />
          <Container direction="inline" gap="small" appearance={appearance}>
            <Button
              color="primary"
              width="auto"
              loading={loading}
              appearance={appearance}
              onClick={() => setInviteLink()}
            >
              {labels?.reset_button_label}
            </Button>
            {!!onCancel && (
              <Button
                type="button"
                color="textOnly"
                width="auto"
                onClick={onCancel}
                appearance={appearance}
              >
                {labels?.cancel_button_label}
              </Button>
            )}
          </Container>
        </Container>
      ) : (
        <form onSubmit={onSubmit} style={{ width: "100%" }}>
          <Container direction={"vertical"} gap="large" appearance={appearance}>
            <div>
              <Label htmlFor="accountRole" appearance={appearance}>
                {labels?.account_role_label}
              </Label>
              <Select
                defaultValue={formData.role}
                onValueChange={(role) => setFormData({ ...formData, role })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={labels?.account_role_label} />
                </SelectTrigger>
                <SelectContent>
                  {accountRoleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="invitationType" appearance={appearance}>
                {labels?.invitation_type_label}
              </Label>
              <Select
                defaultValue={formData.invitationType}
                onValueChange={(invitationType) =>
                  setFormData({ ...formData, invitationType })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={labels?.invitation_type_label} />
                </SelectTrigger>
                <SelectContent>
                  {linkTypeOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!!error && <ErrorMessage error={error} />}
            <Container direction="inline" gap="small" appearance={appearance}>
              <Button
                type="submit"
                color="primary"
                width="auto"
                loading={loading}
                appearance={appearance}
              >
                {loading ? labels?.loading_button_label : labels?.button_label}
              </Button>
              {!!onCancel && (
                <Button
                  type="button"
                  color="textOnly"
                  width="auto"
                  onClick={onCancel}
                  appearance={appearance}
                >
                  {labels?.cancel_button_label}
                </Button>
              )}
            </Container>
          </Container>
        </form>
      )}
    </ThemeContainer>
  );
};
