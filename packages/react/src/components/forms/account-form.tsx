"use client";
import {
  CREATE_ACCOUNT_RESPONSE,
  I18nVariables,
  UPDATE_ACCOUNT_RESPONSE,
} from "@usebasejump/shared";
import { FormEvent, useState } from "react";
import { Input } from "../ui/input";
import { Container } from "../ui/container";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import ErrorMessage from "../ui/error-message";
import ThemeContainer from "../ui/theme-container";
import { BasePropsWithClient } from "../../types/base-props";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";

export type ACCOUNT_FORM_DATA = {
  accountName?: string;
  slug?: string;
};

interface Props extends BasePropsWithClient {
  afterSave?: (
    account: UPDATE_ACCOUNT_RESPONSE | CREATE_ACCOUNT_RESPONSE
  ) => void;
  onCancel?: () => void;
  requireSlug?: boolean;
  initialData?: ACCOUNT_FORM_DATA;
  saveFunction: (
    data: ACCOUNT_FORM_DATA
  ) => Promise<PostgrestSingleResponse<any> | PostgrestResponse<any>>;
  labels?: I18nVariables["edit_account_form"];
}

export const AccountForm = ({
  requireSlug = true,
  afterSave,
  onCancel,
  saveFunction,
  labels,
  initialData = {},
  appearance,
  theme = "default",
  supabaseClient,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();
  const [formData, setFormData] = useState<ACCOUNT_FORM_DATA>(initialData);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      if (!formData.accountName) {
        setError(labels?.missing_fields_error);
        return;
      }

      if (requireSlug && !formData.slug) {
        setError(labels?.missing_fields_error);
        return;
      }

      const { data: responseData, error: responseError } = await saveFunction(
        formData
      );

      if (responseError) {
        setError(responseError.message);
        return;
      }

      if (afterSave) {
        afterSave(responseData);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemeContainer appearance={appearance} theme={theme}>
      <form onSubmit={onSubmit} style={{ width: "100%" }}>
        <Container direction={"vertical"} gap="large" appearance={appearance}>
          <div>
            <Label htmlFor="teamName" appearance={appearance}>
              {labels?.account_name_label}
            </Label>
            <Input
              id="teamName"
              type="text"
              name="teamName"
              defaultValue={formData.accountName}
              appearance={appearance}
              onChange={(event) =>
                setFormData({ ...formData, accountName: event.target.value })
              }
              placeholder={labels?.account_name_input_placeholder}
            />
          </div>
          {requireSlug && (
            <div>
              <Label htmlFor="slug" appearance={appearance}>
                {labels?.slug_label}
              </Label>
              <Input
                id="slug"
                type="text"
                name="slug"
                defaultValue={formData.slug}
                appearance={appearance}
                onChange={(event) =>
                  setFormData({ ...formData, slug: event.target.value })
                }
                placeholder={labels?.slug_input_placeholder}
              />
            </div>
          )}
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
    </ThemeContainer>
  );
};
