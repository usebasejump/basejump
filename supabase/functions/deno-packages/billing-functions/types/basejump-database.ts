export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  basejump: {
    Tables: {
      account_user: {
        Row: {
          account_id: string
          account_role: Database["basejump"]["Enums"]["account_role"]
          user_id: string
        }
        Insert: {
          account_id: string
          account_role: Database["basejump"]["Enums"]["account_role"]
          user_id: string
        }
        Update: {
          account_id?: string
          account_role?: Database["basejump"]["Enums"]["account_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_user_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_user_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      accounts: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string | null
          personal_account: boolean
          primary_owner_user_id: string
          private_metadata: Json | null
          public_metadata: Json | null
          slug: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string | null
          personal_account?: boolean
          primary_owner_user_id?: string
          private_metadata?: Json | null
          public_metadata?: Json | null
          slug?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string | null
          personal_account?: boolean
          primary_owner_user_id?: string
          private_metadata?: Json | null
          public_metadata?: Json | null
          slug?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_primary_owner_user_id_fkey"
            columns: ["primary_owner_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      billing_customers: {
        Row: {
          account_id: string
          active: boolean | null
          email: string | null
          id: string
          provider: string | null
        }
        Insert: {
          account_id: string
          active?: boolean | null
          email?: string | null
          id: string
          provider?: string | null
        }
        Update: {
          account_id?: string
          active?: boolean | null
          email?: string | null
          id?: string
          provider?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          }
        ]
      }
      billing_subscriptions: {
        Row: {
          account_id: string
          billing_customer_id: string
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          plan_name: string | null
          price_id: string | null
          provider: string | null
          quantity: number | null
          status: Database["basejump"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          trial_start: string | null
        }
        Insert: {
          account_id: string
          billing_customer_id: string
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          plan_name?: string | null
          price_id?: string | null
          provider?: string | null
          quantity?: number | null
          status?: Database["basejump"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
        }
        Update: {
          account_id?: string
          billing_customer_id?: string
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          plan_name?: string | null
          price_id?: string | null
          provider?: string | null
          quantity?: number | null
          status?: Database["basejump"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_subscriptions_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_subscriptions_billing_customer_id_fkey"
            columns: ["billing_customer_id"]
            referencedRelation: "billing_customers"
            referencedColumns: ["id"]
          }
        ]
      }
      config: {
        Row: {
          billing_provider: string | null
          enable_personal_account_billing: boolean | null
          enable_team_account_billing: boolean | null
          enable_team_accounts: boolean | null
        }
        Insert: {
          billing_provider?: string | null
          enable_personal_account_billing?: boolean | null
          enable_team_account_billing?: boolean | null
          enable_team_accounts?: boolean | null
        }
        Update: {
          billing_provider?: string | null
          enable_personal_account_billing?: boolean | null
          enable_team_account_billing?: boolean | null
          enable_team_accounts?: boolean | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          account_id: string
          account_name: string | null
          account_role: Database["basejump"]["Enums"]["account_role"]
          created_at: string | null
          id: string
          invitation_type: Database["basejump"]["Enums"]["invitation_type"]
          invited_by_user_id: string
          token: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          account_name?: string | null
          account_role: Database["basejump"]["Enums"]["account_role"]
          created_at?: string | null
          id?: string
          invitation_type: Database["basejump"]["Enums"]["invitation_type"]
          invited_by_user_id: string
          token?: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          account_name?: string | null
          account_role?: Database["basejump"]["Enums"]["account_role"]
          created_at?: string | null
          id?: string
          invitation_type?: Database["basejump"]["Enums"]["invitation_type"]
          invited_by_user_id?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_token: {
        Args: {
          length: number
        }
        Returns: string
      }
      get_accounts_with_role: {
        Args: {
          passed_in_role?: Database["basejump"]["Enums"]["account_role"]
        }
        Returns: string[]
      }
      get_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_role_on_account: {
        Args: {
          account_id: string
          account_role?: Database["basejump"]["Enums"]["account_role"]
        }
        Returns: boolean
      }
      is_set: {
        Args: {
          field_name: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_role: "owner" | "member"
      invitation_type: "one_time" | "24_hour"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: {
          lookup_invitation_token: string
        }
        Returns: Json
      }
      create_account: {
        Args: {
          slug?: string
          name?: string
        }
        Returns: Json
      }
      create_invitation: {
        Args: {
          account_id: string
          account_role: Database["basejump"]["Enums"]["account_role"]
          invitation_type: Database["basejump"]["Enums"]["invitation_type"]
        }
        Returns: Json
      }
      current_user_account_role: {
        Args: {
          account_id: string
        }
        Returns: Json
      }
      delete_invitation: {
        Args: {
          invitation_id: string
        }
        Returns: undefined
      }
      get_account: {
        Args: {
          account_id: string
        }
        Returns: Json
      }
      get_account_billing_status: {
        Args: {
          account_id: string
        }
        Returns: Json
      }
      get_account_by_slug: {
        Args: {
          slug: string
        }
        Returns: Json
      }
      get_account_id: {
        Args: {
          slug: string
        }
        Returns: string
      }
      get_account_invitations: {
        Args: {
          account_id: string
          results_limit?: number
          results_offset?: number
        }
        Returns: Json
      }
      get_account_members: {
        Args: {
          account_id: string
          results_limit?: number
          results_offset?: number
        }
        Returns: Json
      }
      get_accounts: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_personal_account: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      lookup_invitation: {
        Args: {
          lookup_invitation_token: string
        }
        Returns: Json
      }
      remove_account_member: {
        Args: {
          account_id: string
          user_id: string
        }
        Returns: undefined
      }
      service_role_upsert_customer_subscription: {
        Args: {
          account_id: string
          customer?: Json
          subscription?: Json
        }
        Returns: undefined
      }
      update_account: {
        Args: {
          account_id: string
          slug?: string
          name?: string
          public_metadata?: Json
          replace_metadata?: boolean
        }
        Returns: Json
      }
      update_account_user_role: {
        Args: {
          account_id: string
          user_id: string
          new_account_role: Database["basejump"]["Enums"]["account_role"]
          make_primary_owner?: boolean
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

