export type Category =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'activities'
  | 'shopping'
  | 'health'
  | 'other'

export interface Trip {
  id: string
  user_id: string
  name: string
  destination?: string
  start_date?: string
  end_date?: string
  currency: string
  budget?: number
  created_at: string
}

export interface Expense {
  id: string
  trip_id: string
  user_id: string
  amount: number
  currency: string
  category: Category
  description?: string
  date: string
  receipt_url?: string
  created_at: string
}
