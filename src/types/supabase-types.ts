export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          team_name: string | null;
          id: string;
          primary_owner_user_id: string;
          updated_at: string | null;
          created_at: string | null;
          personal_account: boolean;
        };
        Insert: {
          team_name?: string | null;
          id?: string;
          primary_owner_user_id?: string;
          updated_at?: string | null;
          created_at?: string | null;
          personal_account?: boolean;
        };
        Update: {
          team_name?: string | null;
          id?: string;
          primary_owner_user_id?: string;
          updated_at?: string | null;
          created_at?: string | null;
          personal_account?: boolean;
        };
      };
      account_user: {
        Row: {
          user_id: string;
          account_id: string;
          account_role: "owner" | "member";
        };
        Insert: {
          user_id: string;
          account_id: string;
          account_role: "owner" | "member";
        };
        Update: {
          user_id?: string;
          account_id?: string;
          account_role?: "owner" | "member";
        };
      };
      billing_customers: {
        Row: {
          account_id: string;
          customer_id: string | null;
          email: string | null;
          active: boolean | null;
          provider: "stripe" | null;
        };
        Insert: {
          account_id: string;
          customer_id?: string | null;
          email?: string | null;
          active?: boolean | null;
          provider?: "stripe" | null;
        };
        Update: {
          account_id?: string;
          customer_id?: string | null;
          email?: string | null;
          active?: boolean | null;
          provider?: "stripe" | null;
        };
      };
      billing_products: {
        Row: {
          id: string;
          active: boolean | null;
          name: string | null;
          description: string | null;
          image: string | null;
          metadata: Json | null;
          provider: "stripe" | null;
        };
        Insert: {
          id: string;
          active?: boolean | null;
          name?: string | null;
          description?: string | null;
          image?: string | null;
          metadata?: Json | null;
          provider?: "stripe" | null;
        };
        Update: {
          id?: string;
          active?: boolean | null;
          name?: string | null;
          description?: string | null;
          image?: string | null;
          metadata?: Json | null;
          provider?: "stripe" | null;
        };
      };
      invitations: {
        Row: {
          account_role: "owner" | "member";
          account_id: string;
          invited_by_user_id: string;
          account_team_name: string | null;
          updated_at: string | null;
          created_at: string | null;
          invitation_type: "one-time" | "24-hour";
          id: string;
          token: string;
        };
        Insert: {
          account_role: "owner" | "member";
          account_id: string;
          invited_by_user_id: string;
          account_team_name?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
          invitation_type: "one-time" | "24-hour";
          id?: string;
          token?: string;
        };
        Update: {
          account_role?: "owner" | "member";
          account_id?: string;
          invited_by_user_id?: string;
          account_team_name?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
          invitation_type?: "one-time" | "24-hour";
          id?: string;
          token?: string;
        };
      };
      billing_prices: {
        Row: {
          id: string;
          billing_product_id: string | null;
          active: boolean | null;
          description: string | null;
          unit_amount: number | null;
          currency: string | null;
          type: "one_time" | "recurring" | null;
          interval: "day" | "week" | "month" | "year" | null;
          interval_count: number | null;
          trial_period_days: number | null;
          metadata: Json | null;
          provider: "stripe" | null;
        };
        Insert: {
          id: string;
          billing_product_id?: string | null;
          active?: boolean | null;
          description?: string | null;
          unit_amount?: number | null;
          currency?: string | null;
          type?: "one_time" | "recurring" | null;
          interval?: "day" | "week" | "month" | "year" | null;
          interval_count?: number | null;
          trial_period_days?: number | null;
          metadata?: Json | null;
          provider?: "stripe" | null;
        };
        Update: {
          id?: string;
          billing_product_id?: string | null;
          active?: boolean | null;
          description?: string | null;
          unit_amount?: number | null;
          currency?: string | null;
          type?: "one_time" | "recurring" | null;
          interval?: "day" | "week" | "month" | "year" | null;
          interval_count?: number | null;
          trial_period_days?: number | null;
          metadata?: Json | null;
          provider?: "stripe" | null;
        };
      };
      billing_subscriptions: {
        Row: {
          id: string;
          account_id: string;
          status:
            | "trialing"
            | "active"
            | "canceled"
            | "incomplete"
            | "incomplete_expired"
            | "past_due"
            | "unpaid"
            | null;
          metadata: Json | null;
          price_id: string | null;
          quantity: number | null;
          cancel_at_period_end: boolean | null;
          provider: "stripe" | null;
          created: string;
          current_period_start: string;
          current_period_end: string;
          ended_at: string | null;
          cancel_at: string | null;
          canceled_at: string | null;
          trial_start: string | null;
          trial_end: string | null;
        };
        Insert: {
          id: string;
          account_id: string;
          status?:
            | "trialing"
            | "active"
            | "canceled"
            | "incomplete"
            | "incomplete_expired"
            | "past_due"
            | "unpaid"
            | null;
          metadata?: Json | null;
          price_id?: string | null;
          quantity?: number | null;
          cancel_at_period_end?: boolean | null;
          provider?: "stripe" | null;
          created?: string;
          current_period_start?: string;
          current_period_end?: string;
          ended_at?: string | null;
          cancel_at?: string | null;
          canceled_at?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
        };
        Update: {
          id?: string;
          account_id?: string;
          status?:
            | "trialing"
            | "active"
            | "canceled"
            | "incomplete"
            | "incomplete_expired"
            | "past_due"
            | "unpaid"
            | null;
          metadata?: Json | null;
          price_id?: string | null;
          quantity?: number | null;
          cancel_at_period_end?: boolean | null;
          provider?: "stripe" | null;
          created?: string;
          current_period_start?: string;
          current_period_end?: string;
          ended_at?: string | null;
          cancel_at?: string | null;
          canceled_at?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string | null;
          updated_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
        };
      };
    };
    Functions: {
      get_service_role_config: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      current_user_account_role: {
        Args: { lookup_account_id: string };
        Returns: Json;
      };
      update_account_user_role: {
        Args: {
          account_id: string;
          user_id: string;
          new_account_role: "owner" | "member";
          make_primary_owner: boolean;
        };
        Returns: undefined;
      };
      get_account_billing_status: {
        Args: { lookup_account_id: string };
        Returns: Json;
      };
      accept_invitation: {
        Args: { lookup_invitation_token: string };
        Returns: string;
      };
      lookup_invitation: {
        Args: { lookup_invitation_token: string };
        Returns: Json;
      };
    };
  };
}

