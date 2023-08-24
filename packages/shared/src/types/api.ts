import { Database } from "./basejump-types";

export type CURRENT_USER_ACCOUNT_ROLE_RESPONSE = {
  account_role: Database["public"]["Tables"]["account_user"]["Row"]["account_role"];
  is_primary_owner: boolean;
  is_personal_account: boolean;
};

export type GET_ACCOUNT_BILLING_STATUS_RESPONSE = {
  account_role: Database["public"]["Tables"]["account_user"]["Row"]["account_role"];
  is_primary_owner: boolean;
  is_personal_account: boolean;
  billing_enabled: boolean;
  account_id?: string;
  billing_subscription_id?: string;
  billing_status?: Database["public"]["Tables"]["billing_subscriptions"]["Row"]["status"];
  billing_customer_id?: string;
  billing_provider?: Database["public"]["Tables"]["billing_subscriptions"]["Row"]["provider"];
  billing_default_plan_id?: string;
  billing_default_trial_days?: number;
  billing_email?: string;
};

export type GET_BILLING_PLANS_RESPONSE = Array<{
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval: "month" | "year" | "one_time";
  interval_count: 1;
  trial_period_days?: 30;
  active?: boolean;
  metadata?: {
    [key: string]: string;
  };
}>;

export type GET_ACCOUNT_RESPONSE = {
  account_id: string;
  role: Database["public"]["Tables"]["account_user"]["Row"]["account_role"];
  is_primary_owner: boolean;
  name: string;
  slug: string;
  personal_account: boolean;
  created_at: Date;
  updated_at: Date;
  metadata: {
    [key: string]: any;
  };
};

export type CREATE_ACCOUNT_RESPONSE = GET_ACCOUNT_RESPONSE;
export type UPDATE_ACCOUNT_RESPONSE = GET_ACCOUNT_RESPONSE;

export type GET_ACCOUNTS_RESPONSE = {
  account_id: string;
  role: Database["public"]["Tables"]["account_user"]["Row"]["account_role"];
  is_primary_owner: boolean;
  name: string;
  slug: string;
  personal_account: boolean;
  created_at: Date;
  updated_at: Date;
}[];

export type GET_ACCOUNT_MEMBERS_RESPONSE = {
  user_id: string;
  name: string;
  account_role: Database["public"]["Tables"]["account_user"]["Row"]["account_role"];
  is_primary_owner: boolean;
}[];

export type GET_ACCOUNT_INVITES_RESPONSE = {
  account_role: Database["public"]["Tables"]["account_user"]["Row"]["account_role"];
  invitation_type: Database["public"]["Tables"]["account_invitations"]["Row"]["invitation_type"];
  created_at: Date;
}[];

export type CREATE_INVITATION_RESPONSE = {
  token: string;
};

export type GET_ACCOUNT_BILLING_STATUS_RESPONSE = {
  subscription_id: string;
  subscription_active: boolean;
  status: Database["public"]["Tables"]["billing_subscriptions"]["Row"]["status"];
  billing_email?: string;
  account_role: Database["public"]["Tables"]["account_user"]["Row"]["account_role"];
  is_primary_owner: boolean;
  billing_enabled: boolean;
};

export type ACCEPT_INVITATION_RESPONSE = {
  account_id: string;
  account_role: Database["public"]["Tables"]["account_user"]["Row"]["account_role"];
  slug: string;
};

export type LOOKUP_INVITATION_RESPONSE = {
  active: boolean;
  account_name: string;
};
