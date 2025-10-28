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

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          name: string
          date: string
          is_active: boolean
          zoom_meeting_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          date: string
          is_active?: boolean
          zoom_meeting_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          date?: string
          is_active?: boolean
          zoom_meeting_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          auth_id: string | null
          name: string
          email: string
          role: Database['public']['Enums']['user_role']
          participant_type: Database['public']['Enums']['participant_type'] | null
          company: string | null
          division: string | null
          is_checked_in: boolean
          is_eligible_to_draw: boolean
          event_checkin_time: string | null
          event_checkin_method: Database['public']['Enums']['checkin_method'] | null
          checked_in_by: string | null
          group_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id?: string | null
          name: string
          email: string
          role?: Database['public']['Enums']['user_role']
          participant_type?: Database['public']['Enums']['participant_type'] | null
          company?: string | null
          division?: string | null
          is_checked_in?: boolean
          is_eligible_to_draw?: boolean
          event_checkin_time?: string | null
          event_checkin_method?: Database['public']['Enums']['checkin_method'] | null
          checked_in_by?: string | null
          group_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string | null
          name?: string
          email?: string
          role?: Database['public']['Enums']['user_role']
          participant_type?: Database['public']['Enums']['participant_type'] | null
          company?: string | null
          division?: string | null
          is_checked_in?: boolean
          is_eligible_to_draw?: boolean
          event_checkin_time?: string | null
          event_checkin_method?: Database['public']['Enums']['checkin_method'] | null
          checked_in_by?: string | null
          group_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_group_id"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      booths: {
        Row: {
          id: string
          name: string
          description: string | null
          poster_url: string | null
          question_text: string | null
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          poster_url?: string | null
          question_text?: string | null
          order?: number
          is_online_only?: boolean
          is_offline_only?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          poster_url?: string | null
          question_text?: string | null
          order?: number
          is_online_only?: boolean
          is_offline_only?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      booth_checkins: {
        Row: {
          id: string
          participant_id: string
          booth_id: string
          answer: string | null
          checkin_time: string
        }
        Insert: {
          id?: string
          participant_id: string
          booth_id: string
          answer?: string | null
          checkin_time?: string
        }
        Update: {
          id?: string
          participant_id?: string
          booth_id?: string
          answer?: string | null
          checkin_time?: string
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
          }
        ]
      }
      groups: {
        Row: {
          id: string
          name: string
          creator_id: string
          is_submitted: boolean
          submitted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          creator_id: string
          is_submitted?: boolean
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          creator_id?: string
          is_submitted?: boolean
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ideations: {
        Row: {
          id: string
          title: string
          description: string
          company_case: string
          creator_id: string
          group_id: string | null
          is_group: boolean
          submitted_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          company_case: string
          creator_id: string
          group_id?: string | null
          is_group?: boolean
          submitted_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          company_case?: string
          creator_id?: string
          group_id?: string | null
          is_group?: boolean
          submitted_at?: string
          created_at?: string
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
          }
        ]
      }
      draw_logs: {
        Row: {
          id: string
          staff_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          staff_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          staff_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "draw_logs_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      draw_winners: {
        Row: {
          id: string
          draw_log_id: string
          participant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          draw_log_id: string
          participant_id: string
          created_at?: string
        }
        Update: {
          id?: string
          draw_log_id?: string
          participant_id?: string
          created_at?: string
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
          }
        ]
      }
    }
    Views: {
      participant_stats: {
        Row: {
          total_participants: number | null
          total_offline: number | null
          total_online: number | null
          total_checked_in: number | null
          checked_in_offline: number | null
          checked_in_online: number | null
          total_eligible_for_draw: number | null
        }
        Relationships: []
      }
      submission_stats: {
        Row: {
          total_submissions: number | null
          group_submissions: number | null
          individual_submissions: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database['public']['Enums']['user_role']
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_participant: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'admin' | 'staff' | 'participant'
      participant_type: 'online' | 'offline'
      checkin_method: 'qr' | 'manual'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
