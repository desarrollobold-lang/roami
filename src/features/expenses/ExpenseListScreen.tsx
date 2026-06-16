import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Receipt, Users, CalendarDays, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Chip, Badge } from '../../components/ui'
import { useExpenses } from './useExpenses'
import { AddExpenseSheet } from './AddExpenseSheet'
import { CATEGORY_CONFIG } from './categoryConfig'
import type { Expense, Trip } from '../../types/expenses'

const TRIP_IMAGE = 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80'

const AI_INSIGHTS = [
  { text: 'Gastaste un 34% más en comida esta semana que tu promedio.', icon: '🍽' },
  { text: 'El transporte es tu segunda categoría más alta. Considera opciones locales.', icon: '🚇' },
  { text: 'Llevas el 33.7% del presupuesto total. ¡Buen ritmo!', icon: '✅' },
]

function formatCC(amount: number, currency: string) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

function dateLabel(d: string) {
  const today = new Date().toISOString().split('T')[0]
  const yest  = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (d === today) return 'Hoy'
  if (d === yest)  return 'Ayer'
  return new Date(d + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

function withinDays(d: string, days: number) {
  return new Date(d + 'T12:00:00') >= new Date(Date.now() - days * 86400000)
}

function groupByDate(expenses: Expense[]): Map<string, Expense[]> {
  const map = new Map<string, Expense[]>()
  for (const e of expenses) {
    const arr = map.get(e.date) ?? []
    arr.push(e)
    map.set(e.date, arr)
  }
  return map
}

type FilterOption = 'all' | 'week' | 'month'

function Skeleton() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-card" style={{ backgroundColor: '#172118' }}>
      <div className="w-10 h-10 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: 'rgba(30,48,34,0.8)' }} />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-2/3 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(30,48,34,0.8)' }} />
        <div className="h-2.5 w-1/3 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(30,48,34,0.6)' }} />
      </div>
      <div className="h-4 w-16 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(30,48,34,0.8)' }} />
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center py-20 gap-5 px-8">
      <div
        style={{
          width: 80, height: 80, borderRadius: '50%',
          backgroundColor: 'rgba(201,168,75,0.08)',
          border: '1px solid rgba(201,168,75,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Receipt size={32} color="#C9A84B" strokeWidth={1.5} />
      </div>
      <div className="text-center space-y-1.5">
        <p style={{ fontSize: 16, fontWeight: 700, color: '#F2EDE4', fontFamily: 'Fraunces, serif' }}>Sin gastos aún</p>
        <p style={{ fontSize: 14, color: '#7A8C78' }}>Agrega tu primer gasto para empezar a registrar el viaje.</p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        style={{
          backgroundColor: '#C9A84B', color: '#0B1410',
          borderRadius: 14, padding: '12px 24px',
          fontSize: 14, fontWeight: 600,
          boxShadow: '0 0 20px rgba(201,168,75,0.3)',
        }}
      >
        Agregar primer gasto
      </button>
    </div>
  )
}

function SwipeRow({ expense, onDelete }: { expense: Expense; onDelete: (id: string) => void }) {
  const [dragging, setDragging] = useState(false)
  const cfg = CATEGORY_CONFIG[expense.category]
  const Icon = cfg.icon

  return (
    <div className="relative overflow-hidden" style={{ borderRadius: 0 }}>
      <div className="absolute inset-0 flex items-center justify-end pr-5" style={{ backgroundColor: '#C97070' }}>
        <Trash2 size={20} color="white" />
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.05}
        onDragStart={() => setDragging(true)}
        onDragEnd={(_, info) => { setDragging(false); if (info.offset.x < -60) onDelete(expense.id) }}
        className="relative flex items-center gap-3 p-4 cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: '#172118', touchAction: 'pan-y' }}
        whileTap={dragging ? undefined : { scale: 0.99 }}
      >
        <div
          style={{
            width: 40, height: 40, borderRadius: 13,
            backgroundColor: cfg.bgColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <Icon size={18} color={cfg.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#F2EDE4' }} className="truncate">
            {expense.description || cfg.label}
          </p>
          <Badge
            variant="default"
            className="mt-1"
            style={{ backgroundColor: cfg.bgColor, color: cfg.color, borderColor: 'transparent' } as React.CSSProperties}
          >
            {cfg.label}
          </Badge>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#C9A84B', fontFamily: 'Fraunces, serif' }}>
            {formatCC(expense.amount, expense.currency)}
          </p>
          <p style={{ fontSize: 11, color: '#7A8C78', marginTop: 2 }}>{expense.currency}</p>
        </div>
      </motion.div>
    </div>
  )
}

export function ExpenseListScreen({ trip }: { trip: Trip }) {
  const { expenses, loading, addExpense, deleteExpense, totalByCurrency } = useExpenses(trip.id)
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterOption>('all')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [insightIdx, setInsightIdx] = useState(0)

  const filtered = useMemo(() => {
    if (filter === 'week')  return expenses.filter((e) => withinDays(e.date, 7))
    if (filter === 'month') return expenses.filter((e) => withinDays(e.date, 30))
    return expenses
  }, [expenses, filter])

  const grouped     = useMemo(() => groupByDate(filtered), [filtered])
  const sortedDates = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a))

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of filtered) map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    return map
  }, [filtered])

  const primaryCurrency  = trip.currency
  const grandTotal       = totalByCurrency[primaryCurrency] ?? 0
  const uniqueCategories = new Set(filtered.map((e) => e.category)).size
  const budgetUsedPct    = Math.min(grandTotal / 2000, 1)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B1410' }}>
      {/* ── Hero image ──────────────────────────── */}
      <div className="relative" style={{ height: 200, backgroundColor: '#172118' }}>
        <img src={TRIP_IMAGE} alt={trip.name} className="w-full h-full object-cover" loading="lazy" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #0B1410 0%, rgba(11,20,16,0.4) 60%, transparent 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{trip.destination ?? 'Sin destino'}</p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F2EDE4', margin: '2px 0 0', lineHeight: 1.1, fontFamily: 'Fraunces, serif' }}>
            {trip.name}
          </h1>
        </div>
      </div>

      {/* ── Controls ────────────────────────────── */}
      <div className="px-5 pt-4 pb-5 space-y-3">
        {/* Total card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,75,0.08) 0%, rgba(91,170,122,0.04) 100%)',
            border: '1px solid rgba(201,168,75,0.15)',
            borderRadius: 22,
            padding: 20,
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, color: '#7A8C78', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            Total gastado
          </p>
          <p style={{ fontSize: 38, fontWeight: 700, color: '#C9A84B', lineHeight: 1, letterSpacing: '-0.5px', fontFamily: 'Fraunces, serif' }}>
            {formatCC(grandTotal, primaryCurrency)}
          </p>
          <p style={{ fontSize: 13, color: '#7A8C78', marginTop: 6, marginBottom: 12 }}>
            {filtered.length} gasto{filtered.length !== 1 ? 's' : ''} · {uniqueCategories} categoría{uniqueCategories !== 1 ? 's' : ''}
          </p>

          {/* Budget bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontSize: 11, color: '#7A8C78' }}>Presupuesto usado</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: budgetUsedPct > 0.8 ? '#C97070' : '#C9A84B' }}>
                {Math.round(budgetUsedPct * 100)}%
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 3, backgroundColor: '#1E3022', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${budgetUsedPct * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                style={{
                  height: '100%', borderRadius: 3,
                  backgroundColor: budgetUsedPct > 0.8 ? '#C97070' : '#C9A84B',
                }}
              />
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2">
          {(['all', 'week', 'month'] as FilterOption[]).map((f) => (
            <Chip
              key={f}
              label={f === 'all' ? 'Todo' : f === 'week' ? 'Esta semana' : 'Este mes'}
              selected={filter === f}
              onPress={() => setFilter(f)}
            />
          ))}
        </div>

        {/* Navigation chips */}
        <div className="flex gap-2">
          <Chip label="Split" icon={<Users size={13} />} onPress={() => navigate(`/trips/${trip.id}/split`)} />
          <Chip label="Itinerario" icon={<CalendarDays size={13} />} onPress={() => navigate(`/trips/${trip.id}/itinerary`)} />
        </div>
      </div>

      {/* ── AI Insight card ──────────────────────── */}
      <div className="px-5 mb-4">
        <motion.div
          key={insightIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: 'rgba(201,168,75,0.06)',
            border: '1px solid rgba(201,168,75,0.14)',
            borderRadius: 18,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36, height: 36, borderRadius: 12, flexShrink: 0,
              backgroundColor: 'rgba(201,168,75,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Sparkles size={16} color="#C9A84B" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#C9A84B', marginBottom: 2 }}>
              {AI_INSIGHTS[insightIdx]!.icon} Insight IA
            </p>
            <p style={{ fontSize: 13, color: '#F2EDE4', lineHeight: 1.45 }}>
              {AI_INSIGHTS[insightIdx]!.text}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInsightIdx((prev) => (prev + 1) % AI_INSIGHTS.length)}
            style={{ color: '#C9A84B', fontSize: 18, flexShrink: 0, paddingLeft: 4 }}
          >
            →
          </button>
        </motion.div>
      </div>

      {/* ── Category summary ─────────────────────── */}
      {categoryTotals.size > 0 && (
        <div className="pb-4">
          <div className="flex gap-3 px-5 overflow-x-auto no-scrollbar">
            {Array.from(categoryTotals.entries()).map(([cat, total]) => {
              const cfg = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]
              const Icon = cfg.icon
              return (
                <div
                  key={cat}
                  className="flex flex-col items-center gap-2 p-3 shrink-0"
                  style={{
                    backgroundColor: '#172118',
                    border: `1px solid ${cfg.color}28`,
                    borderRadius: 20,
                    minWidth: 88,
                  }}
                >
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 12,
                      backgroundColor: cfg.bgColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} color={cfg.color} />
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                    {cfg.label}
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#F2EDE4', textAlign: 'center', fontFamily: 'Fraunces, serif' }}>
                    {formatCC(total, primaryCurrency)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Expense list ─────────────────────────── */}
      <div className="px-5 pb-32 space-y-5">
        {loading ? (
          <div className="space-y-3 pt-2">
            <Skeleton /><Skeleton /><Skeleton />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onAdd={() => setSheetOpen(true)} />
        ) : (
          <AnimatePresence mode="popLayout">
            {sortedDates.map((date) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: '#7A8C78', textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: 4 }}>
                  {dateLabel(date)}
                </p>
                <div
                  style={{
                    backgroundColor: '#172118',
                    border: '1px solid #1E3022',
                    borderRadius: 20,
                    overflow: 'hidden',
                  }}
                >
                  {grouped.get(date)!.map((expense, i) => (
                    <div key={expense.id}>
                      {i > 0 && <div style={{ height: 1, backgroundColor: '#1E3022', marginLeft: 68 }} />}
                      <SwipeRow expense={expense} onDelete={(id) => void deleteExpense(id)} />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── FAB ─────────────────────────────────── */}
      <motion.button
        type="button"
        onClick={() => setSheetOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed flex items-center justify-center rounded-2xl z-40"
        style={{
          bottom: 90, right: 20, width: 56, height: 56,
          backgroundColor: '#C9A84B',
          boxShadow: '0 0 24px rgba(201,168,75,0.4), 0 8px 24px rgba(0,0,0,0.5)',
        }}
        transition={{ duration: 0.15 }}
      >
        <Plus size={24} color="#0B1410" strokeWidth={2.5} />
      </motion.button>

      <AddExpenseSheet
        open={sheetOpen}
        tripId={trip.id}
        defaultCurrency={trip.currency}
        onClose={() => setSheetOpen(false)}
        onAdd={addExpense}
      />
    </div>
  )
}
