import { I18nVariables as AuthUII18nVariables } from "@supabase/auth-ui-shared";

export interface I18nVariables extends AuthUII18nVariables {
  account_roles?: {
    member?: string;
    owner?: string;
    primary_owner?: string;
  };
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
  invite_member_button?: {
    button_label?: string;
    header_text?: string;
    description_text?: string;
  };
  invite_member_form?: {
    invitation_type_label?: string;
    account_role_label?: string;
    button_label?: string;
    loading_button_label?: string;
    cancel_button_label?: string;
    single_use_invitation?: string;
    multi_use_invitation?: string;
    reset_button_label?: string;
  };
  edit_account_button?: {
    button_label?: string;
  };
  edit_account_page?: {
    header_text?: string;
    description_text?: string;
    general_tab_label?: string;
    billing_tab_label?: string;
    members_tab_label?: string;
    new_member_button_label?: string;
    invitations_header_text?: string;
    members_header_text?: string;
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
  };
  account_invitations?: {
    created_label?: string;
    role_label?: string;
    invitation_type_label?: string;
    invitation_type_24_hour?: string;
    invitation_type_one_time?: string;
    no_invitations_text?: string;
  };
  update_member_role?: {
    header_text?: string;
    description_text?: string;
    button_label?: string;
    change_primary_owner_label?: string;
    cancel_button_label?: string;
    new_role_label?: string;
  };
  account_billing?: {
    billing_email_label?: string;
    billing_status_label?: string;
    billing_status_not_setup?: string;
    manage_subscription?: string;
    setup_new_subscription?: string;
  };
  new_billing_subscription_button?: {
    button_label?: string;
  };
  manage_billing_subscription_button?: {
    button_label?: string;
  };
  subscription_plans?: {
    one_time?: string;
    month?: string;
    year?: string;
    select_plan?: string;
    intervals?: {
      year?: string;
      month?: string;
      one_time?: string;
    };
  };
}
