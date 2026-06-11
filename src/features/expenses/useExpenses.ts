import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import type { Expense } from '../../types/expenses'

interface UseExpensesReturn {
  expenses: Expense[]
  loading: boolean
  error: string | null
  addExpense: (data: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  totalByCurrency: Record<string, number>
}

const MOCK_EXPENSES: Expense[] = [
  {
    id: '1', trip_id: 'mock-trip-1', user_id: 'mock',
    amount: 85, currency: 'EUR', category: 'food',
    description: 'Cena en Trastevere', date: '2026-05-17', created_at: '2026-05-17T19:00:00Z',
  },
  {
    id: '2', trip_id: 'mock-trip-1', user_id: 'mock',
    amount: 320, currency: 'EUR', category: 'accommodation',
    description: 'Hotel Le Marais · 2 noches', date: '2026-05-16', created_at: '2026-05-16T13:00:00Z',
  },
  {
    id: '3', trip_id: 'mock-trip-1', user_id: 'mock',
    amount: 45, currency: 'EUR', category: 'transport',
    description: 'Metro + RER París', date: '2026-05-16', created_at: '2026-05-16T10:00:00Z',
  },
  {
    id: '4', trip_id: 'mock-trip-1', user_id: 'mock',
    amount: 28, currency: 'EUR', category: 'activities',
    description: 'Museo del Louvre', date: '2026-05-16', created_at: '2026-05-16T15:00:00Z',
  },
  {
    id: '5', trip_id: 'mock-trip-1', user_id: 'mock',
    amount: 210, currency: 'EUR', category: 'transport',
    description: 'Tren París → Roma', date: '2026-05-17', created_at: '2026-05-17T08:00:00Z',
  },
  {
    id: '6', trip_id: 'mock-trip-1', user_id: 'mock',
    amount: 35, currency: 'EUR', category: 'food',
    description: 'Aperitivo Florencia', date: '2026-05-18', created_at: '2026-05-18T18:00:00Z',
  },
]

export function useExpenses(tripId: string): UseExpensesReturn {
  const isMock = !supabase && tripId === 'mock-trip-1'

  const [expenses, setExpenses] = useState<Expense[]>(() => isMock ? MOCK_EXPENSES : [])
  const [loading, setLoading] = useState(!isMock)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', tripId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setExpenses((data as Expense[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar gastos')
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    if (!supabase) return

    setLoading(true)
    void fetchExpenses()

    const channel = supabase
      .channel(`expenses:${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          void fetchExpenses()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [tripId, fetchExpenses])

  const addExpense = useCallback(
    async (data: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => {
      if (!supabase) {
        setExpenses((prev) => [
          { ...data, id: `mock-${Date.now()}`, user_id: 'mock', created_at: new Date().toISOString() },
          ...prev,
        ])
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('No autenticado')

      const { error: insertError } = await supabase.from('expenses').insert({
        ...data,
        user_id: user.id,
      })

      if (insertError) throw insertError
    },
    []
  )

  const deleteExpense = useCallback(async (id: string) => {
    if (!supabase) {
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      return
    }

    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError
  }, [])

  const totalByCurrency = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.currency] = (acc[e.currency] ?? 0) + e.amount
    return acc
  }, {})

  return { expenses, loading, error, addExpense, deleteExpense, totalByCurrency }
}
