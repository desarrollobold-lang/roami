export interface ItineraryDay {
  id: string
  trip_id: string
  day_number: number
  date: string
  title: string
  activities: Activity[]
}

export interface Activity {
  id: string
  day_id: string
  time: string
  title: string
  location?: string
  notes?: string
  type: 'transport' | 'accommodation' | 'food' | 'activity' | 'free'
  completed: boolean
}
