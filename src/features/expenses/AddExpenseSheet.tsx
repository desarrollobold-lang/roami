import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button, Input, Chip } from '../../components/ui'
import { CATEGORY_CONFIG, CATEGORIES } from './categoryConfig'
import type { Category, Expense } from '../../types/expenses'

interface AddExpenseSheetProps {
  open: boolean
  tripId: string
  defaultCurrency?: string
  onClose: () => void
  onAdd: (data: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => Promise<void>
}

const CURRENCIES = ['CLP', 'USD', 'EUR']

type DateOption = 'today' | 'yesterday' | 'custom'

function toISODate(opt: DateOption, custom?: string): string {
  if (opt === 'custom' && custom) return custom
  const d = new Date()
  if (opt === 'yesterday') d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function AddExpenseSheet({
  open,
  tripId,
  defaultCurrency = 'CLP',
  onClose,
  onAdd,
}: AddExpenseSheetProps) {
  const [rawAmount, setRawAmount] = useState('')
  const [currency, setCurrency] = useState(defaultCurrency)
  const [category, setCategory] = useState<Category | null>(null)
  const [description, setDescription] = useState('')
  const [dateOption, setDateOption] = useState<DateOption>('today')
  const [customDate, setCustomDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [shakeAmount, setShakeAmount] = useState(false)
  const [toast, setToast] = useState(false)

  const amount = parseFloat(rawAmount.replace(',', '.')) || 0

  const reset = useCallback(() => {
    setRawAmount('')
    setCurrency(defaultCurrency)
    setCategory(null)
    setDescription('')
    setDateOption('today')
    setCustomDate('')
    setLoading(false)
    setShakeAmount(false)
  }, [defaultCurrency])

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    if (amount <= 0 || !category) {
      setShakeAmount(true)
      setTimeout(() => setShakeAmount(false), 600)
      return
    }

    setLoading(true)
    try {
      await onAdd({
        trip_id: tripId,
        amount,
        currency,
        category,
        description: description.trim() || undefined,
        date: toISODate(dateOption, customDate),
      })
      setToast(true)
      setTimeout(() => {
        setToast(false)
        handleClose()
      }, 900)
    } catch {
      setLoading(false)
    }
  }

  const formattedAmount = amount > 0
    ? new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount)
    : null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50"
            style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[28px] overflow-hidden"
            style={{ backgroundColor: '#1F1F21', maxHeight: '92dvh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) handleClose()
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 shrink-0">
              <h2 className="text-lg font-semibold text-text-primary">Nuevo gasto</h2>
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center justify-center w-8 h-8 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <X size={16} color="#A0A0A8" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-6">

              {/* Amount */}
              <div className="flex flex-col items-center gap-3 pt-2">
                <motion.div
                  animate={shakeAmount ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full"
                >
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={rawAmount}
                    onChange={(e) => setRawAmount(e.target.value)}
                    className="w-full text-center bg-transparent text-text-primary outline-none"
                    style={{ fontSize: 48, fontWeight: 700, lineHeight: 1 }}
                  />
                  {formattedAmount && (
                    <p className="text-center text-text-secondary text-sm mt-1">
                      {formattedAmount}
                    </p>
                  )}
                </motion.div>

                {/* Currency chips */}
                <div className="flex gap-2">
                  {CURRENCIES.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      selected={currency === c}
                      onPress={() => setCurrency(c)}
                    />
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">Categoría</p>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map((cat) => {
                    const cfg = CATEGORY_CONFIG[cat]
                    const Icon = cfg.icon
                    const isSelected = category === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-chip text-sm font-medium border transition-all duration-200"
                        style={{
                          backgroundColor: isSelected ? cfg.bgColor : 'rgba(255,255,255,0.06)',
                          borderColor: isSelected ? cfg.color : 'rgba(255,255,255,0.08)',
                          color: isSelected ? cfg.color : '#A0A0A8',
                        }}
                      >
                        <Icon size={14} />
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Description */}
              <Input
                label="Descripción (opcional)"
                placeholder="¿En qué gastaste?"
                value={description}
                onChange={setDescription}
              />

              {/* Date */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">Fecha</p>
                <div className="flex gap-2">
                  {(['today', 'yesterday', 'custom'] as DateOption[]).map((opt) => (
                    <Chip
                      key={opt}
                      label={opt === 'today' ? 'Hoy' : opt === 'yesterday' ? 'Ayer' : 'Elegir'}
                      selected={dateOption === opt}
                      onPress={() => setDateOption(opt)}
                    />
                  ))}
                </div>
                {dateOption === 'custom' && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full h-11 px-4 rounded-input text-text-primary text-base outline-none border transition-all duration-200"
                    style={{
                      backgroundColor: '#0F0F12',
                      borderColor: 'rgba(255,255,255,0.12)',
                      colorScheme: 'dark',
                    }}
                  />
                )}
              </div>

              {/* Submit */}
              <Button
                variant="primary"
                fullWidth
                loading={loading}
                disabled={amount <= 0 || !category}
                onClick={() => void handleSubmit()}
              >
                Agregar gasto
              </Button>
            </div>
          </motion.div>

          {/* Success toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                key="toast"
                className="fixed top-6 left-1/2 z-[60] -translate-x-1/2 px-5 py-3 rounded-card text-sm font-medium text-text-primary"
                style={{ backgroundColor: '#3F5F3A', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                ✓ Gasto agregado
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
