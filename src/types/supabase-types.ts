export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName: string;
          query: string;
          variables: Json;
          extensions: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
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
          team_name: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          personal_account?: boolean;
          primary_owner_user_id?: string;
          team_name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          personal_account?: boolean;
          primary_owner_user_id?: string;
          team_name?: string | null;
          updated_at?: string | null;
        };
      };
      billing_customers: {
        Row: {
          account_id: string;
          active: boolean | null;
          customer_id: string | null;
          email: string | null;
          provider: Database["public"]["Enums"]["billing_providers"] | null;
        };
        Insert: {
          account_id: string;
          active?: boolean | null;
          customer_id?: string | null;
          email?: string | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
        };
        Update: {
          account_id?: string;
          active?: boolean | null;
          customer_id?: string | null;
          email?: string | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
        };
      };
      billing_prices: {
        Row: {
          active: boolean | null;
          billing_product_id: string | null;
          currency: string | null;
          description: string | null;
          id: string;
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null;
          interval_count: number | null;
          metadata: Json | null;
          provider: Database["public"]["Enums"]["billing_providers"] | null;
          trial_period_days: number | null;
          type: Database["public"]["Enums"]["pricing_type"] | null;
          unit_amount: number | null;
        };
        Insert: {
          active?: boolean | null;
          billing_product_id?: string | null;
          currency?: string | null;
          description?: string | null;
          id: string;
          interval?:
            | Database["public"]["Enums"]["pricing_plan_interval"]
            | null;
          interval_count?: number | null;
          metadata?: Json | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
          trial_period_days?: number | null;
          type?: Database["public"]["Enums"]["pricing_type"] | null;
          unit_amount?: number | null;
        };
        Update: {
          active?: boolean | null;
          billing_product_id?: string | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          interval?:
            | Database["public"]["Enums"]["pricing_plan_interval"]
            | null;
          interval_count?: number | null;
          metadata?: Json | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
          trial_period_days?: number | null;
          type?: Database["public"]["Enums"]["pricing_type"] | null;
          unit_amount?: number | null;
        };
      };
      billing_products: {
        Row: {
          active: boolean | null;
          description: string | null;
          id: string;
          image: string | null;
          metadata: Json | null;
          name: string | null;
          provider: Database["public"]["Enums"]["billing_providers"] | null;
        };
        Insert: {
          active?: boolean | null;
          description?: string | null;
          id: string;
          image?: string | null;
          metadata?: Json | null;
          name?: string | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
        };
        Update: {
          active?: boolean | null;
          description?: string | null;
          id?: string;
          image?: string | null;
          metadata?: Json | null;
          name?: string | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
        };
      };
      billing_subscriptions: {
        Row: {
          account_id: string;
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
          account_team_name: string | null;
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
          account_team_name?: string | null;
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
          account_team_name?: string | null;
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
        Args: { lookup_invitation_token: string };
        Returns: string;
      };
      current_user_account_role: {
        Args: { lookup_account_id: string };
        Returns: Json;
      };
      get_account_billing_status: {
        Args: { lookup_account_id: string };
        Returns: Json;
      };
      get_service_role_config: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      lookup_invitation: {
        Args: { lookup_invitation_token: string };
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
      pricing_plan_interval: "day" | "week" | "month" | "year";
      pricing_type: "one_time" | "recurring";
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid";
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          owner: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          name: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      extension: {
        Args: { name: string };
        Returns: string;
      };
      filename: {
        Args: { name: string };
        Returns: string;
      };
      foldername: {
        Args: { name: string };
        Returns: string[];
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: { size: number; bucket_id: string }[];
      };
      search: {
        Args: {
          prefix: string;
          bucketname: string;
          limits: number;
          levels: number;
          offsets: number;
          search: string;
          sortcolumn: string;
          sortorder: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
