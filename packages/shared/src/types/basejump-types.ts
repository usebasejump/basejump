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
      account_user: {
        Row: {
          account_id: string;
          account_role: Database["public"]["Enums"]["account_role"];
          user_id: string;
        };
        Insert: {
          account_id: string;
          account_role: Database["public"]["Enums"]["account_role"];
          user_id: string;
        };
        Update: {
          account_id?: string;
          account_role?: Database["public"]["Enums"]["account_role"];
          user_id?: string;
        };
      };
      accounts: {
        Row: {
          created_at: string | null;
          id: string;
          personal_account: boolean;
          primary_owner_user_id: string;
          name: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          personal_account?: boolean;
          primary_owner_user_id?: string;
          name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          personal_account?: boolean;
          primary_owner_user_id?: string;
          name?: string | null;
          updated_at?: string | null;
        };
      };
      billing_customers: {
        Row: {
          account_id: string;
          active: boolean | null;
          email: string | null;
          id: string;
          provider: Database["public"]["Enums"]["billing_providers"] | null;
        };
        Insert: {
          account_id: string;
          active?: boolean | null;
          email?: string | null;
          id: string;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
        };
        Update: {
          account_id?: string;
          active?: boolean | null;
          email?: string | null;
          id?: string;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
        };
      };
      billing_subscriptions: {
        Row: {
          account_id: string;
          billing_customer_id: string;
          cancel_at: string | null;
          cancel_at_period_end: boolean | null;
          canceled_at: string | null;
          created: string;
          current_period_end: string;
          current_period_start: string;
          ended_at: string | null;
          id: string;
          metadata: Json | null;
          price_id: string | null;
          provider: Database["public"]["Enums"]["billing_providers"] | null;
          quantity: number | null;
          status: Database["public"]["Enums"]["subscription_status"] | null;
          trial_end: string | null;
          trial_start: string | null;
        };
        Insert: {
          account_id: string;
          billing_customer_id: string;
          cancel_at?: string | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: string | null;
          created?: string;
          current_period_end?: string;
          current_period_start?: string;
          ended_at?: string | null;
          id: string;
          metadata?: Json | null;
          price_id?: string | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
          quantity?: number | null;
          status?: Database["public"]["Enums"]["subscription_status"] | null;
          trial_end?: string | null;
          trial_start?: string | null;
        };
        Update: {
          account_id?: string;
          billing_customer_id?: string;
          cancel_at?: string | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: string | null;
          created?: string;
          current_period_end?: string;
          current_period_start?: string;
          ended_at?: string | null;
          id?: string;
          metadata?: Json | null;
          price_id?: string | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
          quantity?: number | null;
          status?: Database["public"]["Enums"]["subscription_status"] | null;
          trial_end?: string | null;
          trial_start?: string | null;
        };
      };
      invitations: {
        Row: {
          account_id: string;
          account_role: Database["public"]["Enums"]["account_role"];
          account_name: string | null;
          created_at: string | null;
          id: string;
          invitation_type: Database["public"]["Enums"]["invitation_type"];
          invited_by_user_id: string;
          token: string;
          updated_at: string | null;
        };
        Insert: {
          account_id: string;
          account_role: Database["public"]["Enums"]["account_role"];
          account_name?: string | null;
          created_at?: string | null;
          id?: string;
          invitation_type: Database["public"]["Enums"]["invitation_type"];
          invited_by_user_id: string;
          token?: string;
          updated_at?: string | null;
        };
        Update: {
          account_id?: string;
          account_role?: Database["public"]["Enums"]["account_role"];
          account_name?: string | null;
          created_at?: string | null;
          id?: string;
          invitation_type?: Database["public"]["Enums"]["invitation_type"];
          invited_by_user_id?: string;
          token?: string;
          updated_at?: string | null;
        };
      };
      profiles: {
        Row: {
          created_at: string | null;
          id: string;
          name: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_invitation: {
        Args: {
          lookup_invitation_token: string;
        };
        Returns: string;
      };
      current_user_account_role: {
        Args: {
          lookup_account_id: string;
        };
        Returns: Json;
      };
      get_account_billing_status: {
        Args: {
          lookup_account_id: string;
        };
        Returns: Json;
      };
      get_service_role_config: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      lookup_invitation: {
        Args: {
          lookup_invitation_token: string;
        };
        Returns: Json;
      };
      update_account_user_role: {
        Args: {
          account_id: string;
          user_id: string;
          new_account_role: Database["public"]["Enums"]["account_role"];
          make_primary_owner: boolean;
        };
        Returns: undefined;
      };
    };
    Enums: {
      account_role: "owner" | "member";
      billing_providers: "stripe";
      invitation_type: "one-time" | "24-hour";
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
