/**
 * Database Types for Supabase
 *
 * To regenerate these types after schema changes, run:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      booth_checkins: {
        Row: {
          attempts: number
          booth_id: string
          checkin_time: string
          id: string
          participant_id: string
          points: number
        }
        Insert: {
          attempts?: number
          booth_id: string
          checkin_time?: string
          id?: string
          participant_id: string
          points?: number
        }
        Update: {
          attempts?: number
          booth_id?: string
          checkin_time?: string
          id?: string
          participant_id?: string
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "booth_checkins_booth_id_fkey"
            columns: ["booth_id"]
            isOneToOne: false
            referencedRelation: "booths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booth_checkins_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      booths: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          order: number
          poster_url: string | null
          questions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order?: number
          poster_url?: string | null
          questions: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order?: number
          poster_url?: string | null
          questions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      draw_logs: {
        Row: {
          created_at: string
          id: string
          staff_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          staff_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "draw_logs_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      draw_winners: {
        Row: {
          created_at: string
          draw_log_id: string
          id: string
          participant_id: string
        }
        Insert: {
          created_at?: string
          draw_log_id: string
          id?: string
          participant_id: string
        }
        Update: {
          created_at?: string
          draw_log_id?: string
          id?: string
          participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draw_winners_draw_log_id_fkey"
            columns: ["draw_log_id"]
            isOneToOne: false
            referencedRelation: "draw_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_winners_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          date: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          zoom_meeting_url: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          zoom_meeting_url?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          zoom_meeting_url?: string | null
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          participant_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          participant_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          is_submitted: boolean
          name: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          is_submitted?: boolean
          name: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          is_submitted?: boolean
          name?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ideations: {
        Row: {
          company_case: string
          created_at: string
          creator_id: string
          description: string
          group_id: string | null
          id: string
          is_group: boolean
          submitted_at: string
          title: string
          updated_at: string
        }
        Insert: {
          company_case: string
          created_at?: string
          creator_id: string
          description: string
          group_id?: string | null
          id?: string
          is_group?: boolean
          submitted_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_case?: string
          created_at?: string
          creator_id?: string
          description?: string
          group_id?: string | null
          id?: string
          is_group?: boolean
          submitted_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideations_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          checked_in_by: string | null
          company: string | null
          created_at: string
          division: string | null
          email: string
          event_checkin_method:
            | Database["public"]["Enums"]["checkin_method"]
            | null
          event_checkin_time: string | null
          id: string
          is_checked_in: boolean
          is_eligible_to_draw: boolean
          name: string
          participant_type:
            | Database["public"]["Enums"]["participant_type"]
            | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          auth_id?: string | null
          checked_in_by?: string | null
          company?: string | null
          created_at?: string
          division?: string | null
          email: string
          event_checkin_method?:
            | Database["public"]["Enums"]["checkin_method"]
            | null
          event_checkin_time?: string | null
          id?: string
          is_checked_in?: boolean
          is_eligible_to_draw?: boolean
          name: string
          participant_type?:
            | Database["public"]["Enums"]["participant_type"]
            | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          auth_id?: string | null
          checked_in_by?: string | null
          company?: string | null
          created_at?: string
          division?: string | null
          email?: string
          event_checkin_method?:
            | Database["public"]["Enums"]["checkin_method"]
            | null
          event_checkin_time?: string | null
          id?: string
          is_checked_in?: boolean
          is_eligible_to_draw?: boolean
          name?: string
          participant_type?:
            | Database["public"]["Enums"]["participant_type"]
            | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      participant_stats: {
        Row: {
          checked_in_offline: number | null
          checked_in_online: number | null
          total_checked_in: number | null
          total_eligible_for_draw: number | null
          total_offline: number | null
          total_online: number | null
          total_participants: number | null
        }
        Relationships: []
      }
      submission_stats: {
        Row: {
          group_submissions: number | null
          individual_submissions: number | null
          total_submissions: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_user_id: { Args: never; Returns: string }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_participant: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      checkin_method: "qr" | "manual"
      participant_type: "online" | "offline"
      user_role: "admin" | "staff" | "participant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      checkin_method: ["qr", "manual"],
      participant_type: ["online", "offline"],
      user_role: ["admin", "staff", "participant"],
    },
  },
} as const
