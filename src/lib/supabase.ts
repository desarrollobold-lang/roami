import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

console.log('SUPABASE URL:', supabaseUrl?.slice(0, 20))

const isValid = supabaseUrl?.startsWith('https://') && (supabaseAnonKey?.length ?? 0) > 10

export const supabase = isValid
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null as any

export type Database = {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string
          user_id: string
          name: string
          destination: string | null
          start_date: string | null
          end_date: string | null
          currency: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['trips']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['trips']['Insert']>
      }
      expenses: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          amount: number
          currency: string
          category: string
          description: string | null
          date: string
          receipt_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
      }
    }
  }
}
