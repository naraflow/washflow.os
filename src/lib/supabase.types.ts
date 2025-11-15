// Database types for Supabase
// These should match your Supabase database schema

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
      orders: {
        Row: {
          id: string
          customer_name: string
          customer_phone: string
          service_id: string
          service_name: string | null
          service_type: string | null
          weight: number
          quantity: number | null
          unit_price: number
          subtotal: number
          discount: number | null
          surcharge: number | null
          total_amount: number
          payment_method: string
          status: string
          outlet_id: string | null
          outlet_name: string | null
          notes: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
          express: boolean | null
          pickup_delivery: Json | null
          current_stage: string | null
          completed_stages: string[] | null
          estimated_completion: string | null
          rfid_tag_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          address: string | null
          total_orders: number
          total_spent: number
          last_order_date: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          unit_price: number
          unit: string
          is_active: boolean
          is_default: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }
      machines: {
        Row: {
          id: string
          name: string
          type: string
          status: string
          current_order_id: string | null
          outlet_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['machines']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['machines']['Insert']>
      }
      outlets: {
        Row: {
          id: string
          name: string
          address: Json | null
          pricing: Json | null
          operating_hours: Json | null
          manager: Json | null
          iot_settings: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['outlets']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['outlets']['Insert']>
      }
      // Add other tables as needed
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
  }
}

