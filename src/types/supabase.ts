export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      completed_orders: {
        Row: {
          cash_paid: number | null
          change_due: number | null
          created_at: string
          customer_name: string
          date: string
          fees: Json
          id: string
          items: Json
          member_id: string | null
          payment_method: string
          subtotal: number
          tax: number
          total: number
          total_fees: number
          user_id: string
        }
        Insert: {
          cash_paid?: number | null
          change_due?: number | null
          created_at?: string
          customer_name: string
          date: string
          fees: Json
          id?: string
          items: Json
          member_id?: string | null
          payment_method: string
          subtotal: number
          tax: number
          total: number
          total_fees: number
          user_id: string
        }
        Update: {
          cash_paid?: number | null
          change_due?: number | null
          created_at?: string
          customer_name?: string
          date?: string
          fees?: Json
          id?: string
          items?: Json
          member_id?: string | null
          payment_method?: string
          subtotal?: number
          tax?: number
          total?: number
          total_fees?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completed_orders_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          base_price: number
          category: string | null
          created_at: string
          "data-ai-hint": string | null
          id: string
          image_url: string | null
          name: string
          user_id: string
          variants: Json
        }
        Insert: {
          base_price: number
          category?: string | null
          created_at?: string
          "data-ai-hint"?: string | null
          id?: string
          image_url?: string | null
          name: string
          user_id: string
          variants?: Json
        }
        Update: {
          base_price?: number
          category?: string | null
          created_at?: string
          "data-ai-hint"?: string | null
          id?: string
          image_url?: string | null
          name?: string
          user_id?: string
          variants?: Json
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      open_bills: {
        Row: {
          created_at: string
          customer_name: string
          date: string
          fees: Json
          id: string
          items: Json
          member_id: string | null
          subtotal: number
          tax: number
          total: number
          total_fees: number
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          date: string
          fees: Json
          id?: string
          items: Json
          member_id?: string | null
          subtotal: number
          tax: number
          total: number
          total_fees: number
          user_id: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          date?: string
          fees?: Json
          id?: string
          items?: Json
          member_id?: string | null
          subtotal?: number
          tax?: number
          total?: number
          total_fees?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "open_bills_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "open_bills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          address: string
          created_at: string
          currency: string
          footer_message: string
          id: string
          logo_url: string | null
          phone_number: string
          store_name: string
          tax_rate: number
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          currency: string
          footer_message: string
          id?: string
          logo_url?: string | null
          phone_number: string
          store_name: string
          tax_rate: number
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          currency?: string
          footer_message?: string
          id?: string
          logo_url?: string | null
          phone_number?: string
          store_name?: string
          tax_rate?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      store_status: {
        Row: {
          day_started_at: string
          id: number
          status: string
          user_id: string
        }
        Insert: {
          day_started_at?: string
          id?: number
          status?: string
          user_id: string
        }
        Update: {
          day_started_at?: string
          id?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
