"use client";
import {
  CREATE_ACCOUNT_RESPONSE,
  en,
  I18nVariables,
} from "@usebasejump/shared";
import { BasePropsWithClient } from "../../types/base-props";
import { ACCOUNT_FORM_DATA, AccountForm } from "./account-form";
import { merge } from "@supabase/auth-ui-shared";

interface Props extends BasePropsWithClient {
  afterCreate?: (account: CREATE_ACCOUNT_RESPONSE) => void;
  requireSlug?: boolean;
  onCancel?: () => void;
}

export const CreateAccountForm = ({
  requireSlug = true,
  afterCreate,
  onCancel,
  supabaseClient,
  localization,
  ...props
}: Props) => {
  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.create_account_form;

  async function onSave(data: ACCOUNT_FORM_DATA) {
    const response = await supabaseClient.rpc("create_account", {
      name: data.accountName,
      slug: data.slug,
    });

    return response;
  }

  return (
    <AccountForm
      saveFunction={onSave}
      supabaseClient={supabaseClient}
      afterSave={afterCreate}
      requireSlug={requireSlug}
      onCancel={onCancel}
      labels={labels}
      {...props}
    />
  );
};
