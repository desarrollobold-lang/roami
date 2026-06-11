import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ExpenseListScreen } from '../features/expenses'
import type { Trip } from '../types/expenses'

const mockTrip: Trip = {
  id: 'mock-trip-1',
  name: 'Europa 2026',
  destination: 'París, Roma, Florencia',
  currency: 'EUR',
  user_id: 'mock-user',
  created_at: new Date().toISOString(),
}

export function ExpensesPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tripId) return
    async function load() {
      if (tripId === 'mock-trip-1') {
        setTrip(mockTrip)
        setLoading(false)
        return
      }

      if (!supabase) {
        navigate('/trips', { replace: true })
        return
      }

      const { data } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()

      if (!data) {
        navigate('/trips', { replace: true })
        return
      }
      setTrip(data as Trip)
      setLoading(false)
    }
    void load()
  }, [tripId, navigate])

  if (loading || !trip) {
    return (
      <div className="px-5 pt-6 space-y-3">
        <div className="h-8 w-40 rounded-full animate-pulse" style={{ backgroundColor: '#1F1F21' }} />
        <div className="h-32 rounded-card animate-pulse" style={{ backgroundColor: '#1F1F21' }} />
      </div>
    )
  }

  return <ExpenseListScreen trip={trip} />
}
