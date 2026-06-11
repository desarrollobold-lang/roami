export interface SplitGroup {
  id: string
  trip_id: string
  name: string
  members: string[]
  created_at: string
}

export interface SplitExpense {
  id: string
  group_id: string
  description: string
  amount: number
  currency: string
  paid_by: string
  split_between: string[]
  date: string
}

export interface Balance {
  from: string
  to: string
  amount: number
  currency: string
}
