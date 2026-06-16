import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowRight, Check } from 'lucide-react'
import { AddSplitExpenseSheet } from './AddSplitExpenseSheet'
import type { SplitGroup, SplitExpense, Balance } from '../../types/split'

/* ── Palette — no purple ─────────────────────────────── */
const MEMBER_PALETTE: Record<string, { bg: string; text: string; border: string }> = {
  Cris:  { bg: 'rgba(201,168,75,0.12)',  text: '#C9A84B', border: 'rgba(201,168,75,0.25)'  },
  María: { bg: 'rgba(91,170,122,0.12)',  text: '#5BAA7A', border: 'rgba(91,170,122,0.25)'  },
  Diego: { bg: 'rgba(122,140,120,0.12)', text: '#7A8C78', border: 'rgba(122,140,120,0.25)' },
  Ana:   { bg: 'rgba(24,195,243,0.1)',   text: '#18C3F3', border: 'rgba(24,195,243,0.2)'   },
}
const DEFAULT_PALETTE = { bg: 'rgba(30,48,34,0.6)', text: '#7A8C78', border: '#1E3022' }

const MOCK_GROUP: SplitGroup = {
  id: 'group-1', trip_id: 'mock-trip-1',
  name: 'Europa 2026',
  members: ['Cris', 'María', 'Diego', 'Ana'],
  created_at: new Date().toISOString(),
}

const INITIAL_EXPENSES: SplitExpense[] = [
  { id: 'se-1', group_id: 'group-1', description: 'Cena Roma',      amount: 85,  currency: 'EUR', paid_by: 'Cris',  split_between: ['Cris','María','Diego','Ana'], date: '2026-05-15' },
  { id: 'se-2', group_id: 'group-1', description: 'Hotel Florencia', amount: 320, currency: 'EUR', paid_by: 'María', split_between: ['Cris','María','Diego','Ana'], date: '2026-05-16' },
  { id: 'se-3', group_id: 'group-1', description: 'Tren París',      amount: 210, currency: 'EUR', paid_by: 'Diego', split_between: ['Cris','María','Diego','Ana'], date: '2026-05-17' },
  { id: 'se-4', group_id: 'group-1', description: 'Museo Louvre',    amount: 60,  currency: 'EUR', paid_by: 'Ana',   split_between: ['Cris','María','Diego','Ana'], date: '2026-05-18' },
]

function computeBalances(expenses: SplitExpense[]): Balance[] {
  const net: Record<string, number> = {}
  for (const e of expenses) {
    net[e.paid_by] = (net[e.paid_by] ?? 0) + e.amount
    const share = e.amount / e.split_between.length
    for (const m of e.split_between) net[m] = (net[m] ?? 0) - share
  }
  const creditors: { name: string; amount: number }[] = []
  const debtors:   { name: string; amount: number }[] = []
  for (const [name, amount] of Object.entries(net)) {
    if (amount > 0.005) creditors.push({ name, amount })
    else if (amount < -0.005) debtors.push({ name, amount: -amount })
  }
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)
  const balances: Balance[] = []
  let ci = 0, di = 0
  while (ci < creditors.length && di < debtors.length) {
    const cr = creditors[ci]!, db = debtors[di]!
    const transfer = Math.min(cr.amount, db.amount)
    const rounded = Math.round(transfer * 100) / 100
    if (rounded > 0) balances.push({ from: db.name, to: cr.name, amount: rounded, currency: expenses[0]?.currency ?? 'EUR' })
    cr.amount -= transfer; db.amount -= transfer
    if (cr.amount < 0.005) ci++
    if (db.amount < 0.005) di++
  }
  return balances
}

function fmtEur(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const p = MEMBER_PALETTE[name] ?? DEFAULT_PALETTE
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        backgroundColor: p.bg, color: p.text,
        border: `1px solid ${p.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(size * 0.38), fontWeight: 700, flexShrink: 0,
        fontFamily: 'Fraunces, serif',
      }}
    >
      {name[0]}
    </div>
  )
}

type Tab = 'gastos' | 'balances'

export function SplitScreen() {
  const [tab, setTab] = useState<Tab>('gastos')
  const [expenses, setExpenses] = useState<SplitExpense[]>(INITIAL_EXPENSES)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [settled, setSettled] = useState<Set<string>>(new Set())

  const totalAmount = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses])
  const balances = useMemo(() => computeBalances(expenses), [expenses])

  const memberTotals = useMemo(() => {
    const map: Record<string, number> = {}
    for (const m of MOCK_GROUP.members) map[m] = 0
    for (const e of expenses) map[e.paid_by] = (map[e.paid_by] ?? 0) + e.amount
    return map
  }, [expenses])

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: '#0B1410' }}>
      {/* ── Header ──────────────────────────────── */}
      <div
        className="px-5 pt-14 pb-5"
        style={{ background: 'linear-gradient(180deg, rgba(201,168,75,0.05) 0%, rgba(11,20,16,0) 100%)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: '#F2EDE4', margin: 0, letterSpacing: '-0.5px', fontFamily: 'Fraunces, serif' }}>
              Split
            </h1>
            <p style={{ fontSize: 14, color: '#7A8C78', marginTop: 3 }}>Quién debe qué</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1.5 font-semibold text-sm"
            style={{
              backgroundColor: '#C9A84B',
              color: '#0B1410',
              borderRadius: 14,
              padding: '10px 16px',
              boxShadow: '0 0 20px rgba(201,168,75,0.3)',
            }}
          >
            <Plus size={15} strokeWidth={2.8} />
            Agregar
          </motion.button>
        </div>

        {/* ── Summary hero card ───────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,75,0.1) 0%, rgba(201,168,75,0.03) 100%)',
            border: '1px solid rgba(201,168,75,0.2)',
            borderRadius: 22,
            padding: 20,
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, color: '#7A8C78', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Total del grupo
          </p>
          <p style={{ fontSize: 38, fontWeight: 700, color: '#C9A84B', margin: '4px 0 12px', letterSpacing: '-0.5px', fontFamily: 'Fraunces, serif' }}>
            {fmtEur(totalAmount)}
          </p>

          {/* Member contribution bars */}
          <div className="space-y-2 mb-4">
            {MOCK_GROUP.members.map((m) => {
              const pct = totalAmount > 0 ? (memberTotals[m] ?? 0) / totalAmount : 0
              const p = MEMBER_PALETTE[m] ?? DEFAULT_PALETTE
              return (
                <div key={m} className="flex items-center gap-3">
                  <Avatar name={m} size={24} />
                  <div style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: '#1E3022', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 3, backgroundColor: p.text }}
                    />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: p.text, minWidth: 36, textAlign: 'right' }}>
                    {Math.round(pct * 100)}%
                  </span>
                </div>
              )
            })}
          </div>

          {/* Avatars row */}
          <div className="flex items-center gap-2">
            {MOCK_GROUP.members.map((m, i) => (
              <div key={m} style={{ marginLeft: i > 0 ? -6 : 0 }}>
                <Avatar name={m} size={32} />
              </div>
            ))}
            <span style={{ fontSize: 12, color: '#7A8C78', marginLeft: 8 }}>
              {MOCK_GROUP.members.length} participantes
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────── */}
      <div
        className="flex mx-5 mb-4 p-1 rounded-2xl"
        style={{ backgroundColor: '#172118', border: '1px solid #1E3022' }}
      >
        {(['gastos', 'balances'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="relative flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200"
            style={{ color: tab === t ? '#0B1410' : '#7A8C78' }}
          >
            {tab === t && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 rounded-xl"
                style={{ backgroundColor: '#C9A84B', boxShadow: '0 0 12px rgba(201,168,75,0.3)' }}
                transition={{ duration: 0.2 }}
              />
            )}
            <span className="relative z-10">{t === 'gastos' ? 'Gastos' : 'Balances'}</span>
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────── */}
      <AnimatePresence mode="wait">
        {tab === 'gastos' ? (
          <motion.div
            key="gastos"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="px-5 space-y-3"
          >
            {expenses.map((e) => {
              const p = MEMBER_PALETTE[e.paid_by] ?? DEFAULT_PALETTE
              return (
                <div
                  key={e.id}
                  style={{
                    backgroundColor: '#172118',
                    border: '1px solid #1E3022',
                    borderRadius: 20,
                    padding: 16,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={e.paid_by} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#F2EDE4' }}>{e.description}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span
                          style={{
                            fontSize: 11, fontWeight: 700,
                            backgroundColor: p.bg, color: p.text,
                            border: `1px solid ${p.border}`,
                            padding: '2px 9px', borderRadius: 999,
                          }}
                        >
                          Pagó {e.paid_by}
                        </span>
                        <span style={{ fontSize: 11, color: '#7A8C78' }}>
                          ÷ {e.split_between.length} personas
                        </span>
                        <span style={{ fontSize: 11, color: '#7A8C78' }}>
                          {e.date}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: '#F2EDE4', fontFamily: 'Fraunces, serif' }}>
                        {fmtEur(e.amount)}
                      </p>
                      <p style={{ fontSize: 11, color: '#7A8C78', marginTop: 2 }}>
                        {fmtEur(e.amount / e.split_between.length)} c/u
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            key="balances"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="px-5 space-y-3"
          >
            {balances.length === 0 ? (
              <div className="text-center py-12">
                <div
                  className="flex items-center justify-center mx-auto mb-4"
                  style={{
                    width: 64, height: 64, borderRadius: '50%',
                    backgroundColor: 'rgba(91,170,122,0.1)',
                    border: '1px solid rgba(91,170,122,0.2)',
                  }}
                >
                  <Check size={28} color="#5BAA7A" strokeWidth={2} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#F2EDE4', fontFamily: 'Fraunces, serif' }}>¡Todo saldado!</p>
                <p style={{ fontSize: 13, color: '#7A8C78', marginTop: 4 }}>No hay deudas pendientes en el grupo.</p>
              </div>
            ) : (
              balances.map((b) => {
                const key = `${b.from}-${b.to}`
                const isSettled = settled.has(key)
                const fromP = MEMBER_PALETTE[b.from] ?? DEFAULT_PALETTE
                const toP   = MEMBER_PALETTE[b.to]   ?? DEFAULT_PALETTE

                return (
                  <motion.div
                    key={key}
                    layout
                    animate={{ opacity: isSettled ? 0.4 : 1 }}
                    style={{
                      backgroundColor: '#172118',
                      border: isSettled
                        ? '1px solid rgba(91,170,122,0.2)'
                        : '1px solid #1E3022',
                      borderRadius: 20,
                      padding: 16,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={b.from} size={40} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: 14, fontWeight: 700, color: fromP.text }}>{b.from}</span>
                          <ArrowRight size={14} color="#7A8C78" />
                          <span style={{ fontSize: 14, fontWeight: 700, color: toP.text }}>{b.to}</span>
                        </div>
                        <p style={{ fontSize: 12, color: isSettled ? '#5BAA7A' : '#7A8C78', marginTop: 2 }}>
                          {isSettled ? '✓ Liquidado' : 'Transferencia pendiente'}
                        </p>
                      </div>

                      <Avatar name={b.to} size={40} />
                    </div>

                    <div
                      className="flex items-center justify-between mt-3 pt-3"
                      style={{ borderTop: '1px solid rgba(30,48,34,0.8)' }}
                    >
                      <p style={{ fontSize: 22, fontWeight: 700, color: '#F2EDE4', fontFamily: 'Fraunces, serif' }}>
                        {fmtEur(b.amount)}
                      </p>
                      {!isSettled ? (
                        <motion.button
                          whileTap={{ scale: 0.93 }}
                          type="button"
                          onClick={() => setSettled((prev) => new Set([...prev, key]))}
                          className="flex items-center gap-1.5 font-semibold text-sm"
                          style={{
                            backgroundColor: 'rgba(201,168,75,0.08)',
                            color: '#C9A84B',
                            border: '1px solid rgba(201,168,75,0.3)',
                            borderRadius: 12,
                            padding: '8px 14px',
                          }}
                        >
                          <Check size={14} strokeWidth={2.5} />
                          Liquidar
                        </motion.button>
                      ) : (
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#5BAA7A',
                            backgroundColor: 'rgba(91,170,122,0.08)',
                            padding: '6px 12px',
                            borderRadius: 10,
                          }}
                        >
                          ✓ Pagado
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
      >
        <Plus size={24} color="#0B1410" strokeWidth={2.5} />
      </motion.button>

      <AddSplitExpenseSheet
        open={sheetOpen}
        group={MOCK_GROUP}
        onClose={() => setSheetOpen(false)}
        onAdd={(data) => setExpenses((prev) => [{ ...data, id: `se-${Date.now()}` }, ...prev])}
      />
    </div>
  )
}
