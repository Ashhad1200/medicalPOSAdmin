// Database type definition for Supabase based on actual schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          supabase_uid: string;
          username: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: string | null;
          role_in_pos: string | null;
          permissions: any[] | null;
          organization_id: string;
          subscription_status: string | null;
          access_valid_till: string | null;
          trial_ends_at: string | null;
          last_access_extension: string | null;
          is_trial_user: boolean | null;
          is_active: boolean | null;
          is_email_verified: boolean | null;
          last_login: string | null;
          login_attempts: number | null;
          locked_until: string | null;
          password_reset_token: string | null;
          password_reset_expires: string | null;
          two_factor_enabled: boolean | null;
          two_factor_secret: string | null;
          preferences: Record<string, any> | null;
          theme: string | null;
          language: string | null;
          timezone: string | null;
          notification_settings: Record<string, any> | null;
          created_by: string | null;
          approved_by: string | null;
          approved_at: string | null;
          deactivated_by: string | null;
          deactivated_at: string | null;
          deactivation_reason: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          logo_url: string | null;
          is_active: boolean;
          subscription_tier: string;
          max_users: number;
          current_users: number;
          trial_ends_at: string | null;
          access_valid_till: string | null;
          billing_email: string | null;
          tax_id: string | null;
          currency: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          action: string;
          entity: string;
          entity_id: string;
          user_id: string | null;
          organization_id: string | null;
          old_values: Record<string, any> | null;
          new_values: Record<string, any> | null;
          reason: string | null;
          metadata: Record<string, any> | null;
          timestamp: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
      };
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
  };
}

// Export convenience types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
