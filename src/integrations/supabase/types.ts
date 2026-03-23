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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      booking_items: {
        Row: {
          booking_id: string
          course_date_id: string | null
          created_at: string
          fahrstunden_package_id: string | null
          fahrstunden_service_id: string | null
          id: string
          instructor: string | null
        }
        Insert: {
          booking_id: string
          course_date_id?: string | null
          created_at?: string
          fahrstunden_package_id?: string | null
          fahrstunden_service_id?: string | null
          id?: string
          instructor?: string | null
        }
        Update: {
          booking_id?: string
          course_date_id?: string | null
          created_at?: string
          fahrstunden_package_id?: string | null
          fahrstunden_service_id?: string | null
          id?: string
          instructor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_course_date_id_fkey"
            columns: ["course_date_id"]
            isOneToOne: false
            referencedRelation: "course_dates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_fahrstunden_package_id_fkey"
            columns: ["fahrstunden_package_id"]
            isOneToOne: false
            referencedRelation: "fahrstunden_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_fahrstunden_service_id_fkey"
            columns: ["fahrstunden_service_id"]
            isOneToOne: false
            referencedRelation: "fahrstunden_services"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          address: string
          birth_date: string
          booking_type: string
          created_at: string
          email: string
          fa_number: string
          first_name: string
          id: string
          last_name: string
          payment_method: string
          phone: string
          status: string
          total_price: number
          updated_at: string
        }
        Insert: {
          address: string
          birth_date: string
          booking_type: string
          created_at?: string
          email: string
          fa_number: string
          first_name: string
          id?: string
          last_name: string
          payment_method: string
          phone: string
          status?: string
          total_price: number
          updated_at?: string
        }
        Update: {
          address?: string
          birth_date?: string
          booking_type?: string
          created_at?: string
          email?: string
          fa_number?: string
          first_name?: string
          id?: string
          last_name?: string
          payment_method?: string
          phone?: string
          status?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      course_dates: {
        Row: {
          created_at: string
          date: string
          day: string
          id: string
          instructor: string | null
          location: string
          part: number
          price: number
          spots_available: number
          time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          day: string
          id: string
          instructor?: string | null
          location?: string
          part: number
          price?: number
          spots_available?: number
          time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          day?: string
          id?: string
          instructor?: string | null
          location?: string
          part?: number
          price?: number
          spots_available?: number
          time?: string
          updated_at?: string
        }
        Relationships: []
      }
      fahrstunden_packages: {
        Row: {
          created_at: string
          discount: string
          id: string
          lessons: number
          name: string
          price_per_lesson: number
          service_id: string
          total_price: number
        }
        Insert: {
          created_at?: string
          discount: string
          id: string
          lessons: number
          name: string
          price_per_lesson: number
          service_id: string
          total_price: number
        }
        Update: {
          created_at?: string
          discount?: string
          id?: string
          lessons?: number
          name?: string
          price_per_lesson?: number
          service_id?: string
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "fahrstunden_packages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "fahrstunden_services"
            referencedColumns: ["id"]
          },
        ]
      }
      fahrstunden_services: {
        Row: {
          category: string
          created_at: string
          duration: string
          id: string
          name: string
          price: number
        }
        Insert: {
          category: string
          created_at?: string
          duration: string
          id: string
          name: string
          price: number
        }
        Update: {
          category?: string
          created_at?: string
          duration?: string
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_spots: { Args: { course_id: string }; Returns: undefined }
      increment_spots: { Args: { course_id: string }; Returns: undefined }
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
