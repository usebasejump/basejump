"use client";
import {
  CREATE_ACCOUNT_RESPONSE,
  en,
  I18nVariables,
} from "@usebasejump/shared";
import { BasePropsWithClient } from "../../types/base-props";
import { ACCOUNT_FORM_DATA, AccountForm } from "./account-form";
import { useAccount } from "../../api/use-account";
import { merge } from "@supabase/auth-ui-shared";

interface Props extends BasePropsWithClient {
  afterUpdate?: (account: CREATE_ACCOUNT_RESPONSE) => void;
  requireSlug?: boolean;
  accountId?: string;
  accountSlug?: string;
  onCancel?: () => void;
}

export const EditAccountForm = ({
  accountId,
  accountSlug,
  onCancel,
  requireSlug = true,
  afterUpdate,
  supabaseClient,
  localization,
  ...props
}: Props) => {
  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.edit_account_form;

  const { data: account } = useAccount({
    accountId,
    accountSlug,
    supabaseClient,
  });

  async function onSave(data: ACCOUNT_FORM_DATA) {
    if (!account) {
      throw new Error("No account found");
    }
    return supabaseClient.rpc("update_account", {
      account_id: account.account_id,
      name: data.accountName,
      slug: data.slug,
    });
  }

  if (!account) {
    return null;
  }

  return (
    <AccountForm
      initialData={{ accountName: account.name, slug: account.slug }}
      saveFunction={onSave}
      supabaseClient={supabaseClient}
      labels={labels}
      onCancel={onCancel}
      {...props}
      afterSave={afterUpdate}
      requireSlug={requireSlug}
    />
  );
};
