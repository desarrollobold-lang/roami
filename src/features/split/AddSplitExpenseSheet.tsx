import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button, Input, Chip } from '../../components/ui'
import type { SplitExpense, SplitGroup } from '../../types/split'

const MEMBER_COLORS: Record<string, string> = {
  Cris: '#674CBF',
  María: '#18C3F3',
  Diego: '#3F5F3A',
  Ana: '#C9A44E',
}

const CURRENCIES = ['CLP', 'USD', 'EUR']
type DateOption = 'today' | 'yesterday'

interface AddSplitExpenseSheetProps {
  open: boolean
  group: SplitGroup
  onClose: () => void
  onAdd: (data: Omit<SplitExpense, 'id'>) => void
}

export function AddSplitExpenseSheet({ open, group, onClose, onAdd }: AddSplitExpenseSheetProps) {
  const [description, setDescription] = useState('')
  const [rawAmount, setRawAmount] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [paidBy, setPaidBy] = useState(group.members[0] ?? '')
  const [splitBetween, setSplitBetween] = useState<string[]>(group.members)
  const [dateOption, setDateOption] = useState<DateOption>('today')

  const amount = parseFloat(rawAmount.replace(',', '.')) || 0

  const reset = useCallback(() => {
    setDescription('')
    setRawAmount('')
    setCurrency('EUR')
    setPaidBy(group.members[0] ?? '')
    setSplitBetween(group.members)
    setDateOption('today')
  }, [group.members])

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = () => {
    if (!description.trim() || amount <= 0 || splitBetween.length === 0) return
    const date = new Date()
    if (dateOption === 'yesterday') date.setDate(date.getDate() - 1)
    onAdd({
      group_id: group.id,
      description: description.trim(),
      amount,
      currency,
      paid_by: paidBy,
      split_between: splitBetween,
      date: date.toISOString().slice(0, 10),
    })
    handleClose()
  }

  const toggleSplitMember = (member: string) => {
    setSplitBetween((prev) =>
      prev.includes(member)
        ? prev.length > 1
          ? prev.filter((m) => m !== member)
          : prev
        : [...prev, member]
    )
  }

  function MemberChip({
    member,
    selected,
    onPress,
  }: {
    member: string
    selected: boolean
    onPress: () => void
  }) {
    const color = MEMBER_COLORS[member] ?? '#A0A0A8'
    return (
      <button
        type="button"
        onClick={onPress}
        className="flex items-center gap-2 px-3 py-2 rounded-chip text-sm font-medium border transition-all duration-200"
        style={{
          backgroundColor: selected ? `${color}22` : 'rgba(255,255,255,0.06)',
          borderColor: selected ? color : 'rgba(255,255,255,0.08)',
          color: selected ? color : '#A0A0A8',
        }}
      >
        <span
          className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
          style={{ backgroundColor: `${color}33`, color }}
        >
          {member[0]}
        </span>
        {member}
      </button>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50"
            style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

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
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            </div>

            <div className="flex items-center justify-between px-5 py-3 shrink-0">
              <h2 className="text-lg font-semibold text-text-primary">Nuevo gasto split</h2>
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center justify-center w-8 h-8 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <X size={16} color="#A0A0A8" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">
              <Input
                label="Descripción"
                placeholder="¿En qué gastaron?"
                value={description}
                onChange={setDescription}
              />

              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">Monto</p>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={rawAmount}
                  onChange={(e) => setRawAmount(e.target.value)}
                  className="w-full text-center bg-transparent text-text-primary outline-none"
                  style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}
                />
                <div className="flex gap-2 justify-center">
                  {CURRENCIES.map((c) => (
                    <Chip key={c} label={c} selected={currency === c} onPress={() => setCurrency(c)} />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">Pagado por</p>
                <div className="flex gap-2 flex-wrap">
                  {group.members.map((member) => (
                    <MemberChip
                      key={member}
                      member={member}
                      selected={paidBy === member}
                      onPress={() => setPaidBy(member)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">Dividir entre</p>
                <div className="flex gap-2 flex-wrap">
                  {group.members.map((member) => (
                    <MemberChip
                      key={member}
                      member={member}
                      selected={splitBetween.includes(member)}
                      onPress={() => toggleSplitMember(member)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">Fecha</p>
                <div className="flex gap-2">
                  {(['today', 'yesterday'] as DateOption[]).map((opt) => (
                    <Chip
                      key={opt}
                      label={opt === 'today' ? 'Hoy' : 'Ayer'}
                      selected={dateOption === opt}
                      onPress={() => setDateOption(opt)}
                    />
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                fullWidth
                disabled={!description.trim() || amount <= 0 || splitBetween.length === 0}
                onClick={handleSubmit}
              >
                Agregar al split
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
