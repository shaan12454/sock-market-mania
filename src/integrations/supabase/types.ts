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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      action_cooldowns: {
        Row: {
          action_id: string
          last_used: string
          player_id: string
        }
        Insert: {
          action_id: string
          last_used: string
          player_id: string
        }
        Update: {
          action_id?: string
          last_used?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_cooldowns_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      global_events: {
        Row: {
          description: string | null
          event_name: string
          id: number
          triggered_at: string | null
        }
        Insert: {
          description?: string | null
          event_name: string
          id?: number
          triggered_at?: string | null
        }
        Update: {
          description?: string | null
          event_name?: string
          id?: number
          triggered_at?: string | null
        }
        Relationships: []
      }
      headlines: {
        Row: {
          created_at: string | null
          event_type: string | null
          id: number
          text: string
        }
        Insert: {
          created_at?: string | null
          event_type?: string | null
          id?: number
          text: string
        }
        Update: {
          created_at?: string | null
          event_type?: string | null
          id?: number
          text?: string
        }
        Relationships: []
      }
      market: {
        Row: {
          price: number
          price_history: number[] | null
          sock_type: string
          updated_at: string | null
        }
        Insert: {
          price: number
          price_history?: number[] | null
          sock_type: string
          updated_at?: string | null
        }
        Update: {
          price?: number
          price_history?: number[] | null
          sock_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string | null
          faction: string | null
          id: string
          sock_coins: number | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          faction?: string | null
          id?: string
          sock_coins?: number | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          faction?: string | null
          id?: string
          sock_coins?: number | null
          username?: string | null
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          player_id: string
          shares: number | null
          sock_type: string
        }
        Insert: {
          player_id: string
          shares?: number | null
          sock_type: string
        }
        Update: {
          player_id?: string
          shares?: number | null
          sock_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolios_sock_type_fkey"
            columns: ["sock_type"]
            isOneToOne: false
            referencedRelation: "market"
            referencedColumns: ["sock_type"]
          },
        ]
      }
      sock: {
        Row: {
          age_days: number | null
          aura: number | null
          chaos_level: number | null
          cleanliness: number | null
          cult_influence: number | null
          drip: number | null
          emotional_stability: number | null
          has_crown: boolean | null
          has_duct_tape: boolean | null
          has_glasses: boolean | null
          has_mold: boolean | null
          heat_damage: number | null
          id: number
          intelligence: number | null
          is_charred: boolean | null
          is_glowing: boolean | null
          radiation: number | null
          smell: number | null
          updated_at: string | null
          wetness: number | null
        }
        Insert: {
          age_days?: number | null
          aura?: number | null
          chaos_level?: number | null
          cleanliness?: number | null
          cult_influence?: number | null
          drip?: number | null
          emotional_stability?: number | null
          has_crown?: boolean | null
          has_duct_tape?: boolean | null
          has_glasses?: boolean | null
          has_mold?: boolean | null
          heat_damage?: number | null
          id?: number
          intelligence?: number | null
          is_charred?: boolean | null
          is_glowing?: boolean | null
          radiation?: number | null
          smell?: number | null
          updated_at?: string | null
          wetness?: number | null
        }
        Update: {
          age_days?: number | null
          aura?: number | null
          chaos_level?: number | null
          cleanliness?: number | null
          cult_influence?: number | null
          drip?: number | null
          emotional_stability?: number | null
          has_crown?: boolean | null
          has_duct_tape?: boolean | null
          has_glasses?: boolean | null
          has_mold?: boolean | null
          heat_damage?: number | null
          id?: number
          intelligence?: number | null
          is_charred?: boolean | null
          is_glowing?: boolean | null
          radiation?: number | null
          smell?: number | null
          updated_at?: string | null
          wetness?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
