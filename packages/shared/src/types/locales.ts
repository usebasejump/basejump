import { I18nVariables as AuthUII18nVariables } from "@supabase/auth-ui-shared";

export interface I18nVariables extends AuthUII18nVariables {
  sign_in_button?: {
    button_label?: string;
  };
  sign_up_button?: {
    button_label?: string;
  };
  user_button?: {
    sign_out?: string;
    edit_profile?: string;
  };
  edit_account_button?: {
    button_label?: string;
    header_text?: string;
    description_text?: string;
    general_tab_label?: string;
    billing_tab_label?: string;
    members_tab_label?: string;
  };
  create_account_button?: {
    button_label?: string;
    header_text?: string;
    description_text?: string;
  };
  edit_profile_button?: {
    button_label?: string;
    header_text?: string;
    description_text?: string;
  };
  account_selector?: {
    create_new_team?: string;
    personal_account?: string;
    team_accounts?: string;
    search_placeholder?: string;
    no_results?: string;
    my_account?: string;
  };
  edit_account_form?: {
    account_name_label?: string;
    account_name_input_placeholder?: string;
    slug_label?: string;
    slug_input_placeholder?: string;
    button_label?: string;
    loading_button_label?: string;
    missing_fields_error?: string;
    cancel_button_label?: string;
  };
  create_account_form?: {
    account_name_label?: string;
    account_name_input_placeholder?: string;
    slug_label?: string;
    slug_input_placeholder?: string;
    button_label?: string;
    loading_button_label?: string;
    missing_fields_error?: string;
    cancel_button_label?: string;
  };
  account_members?: {
    member_label?: string;
    role_label?: string;
    remove_member?: string;
    change_role?: string;
    primary_owner_label?: string;
  };
  update_member_role?: {
    header_text?: string;
    description_text?: string;
    button_label?: string;
    change_primary_owner_label?: string;
    cancel_button_label?: string;
    new_role_label?: string;
  };
}
