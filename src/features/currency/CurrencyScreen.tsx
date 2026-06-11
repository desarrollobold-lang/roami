import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeftRight, Star, TrendingUp, TrendingDown, AlertCircle, Info, ChevronDown } from 'lucide-react'

/* ── Data ────────────────────────────────────────────── */
const CURRENCIES = ['CLP', 'USD', 'EUR', 'GBP', 'JPY', 'ARS', 'BRL'] as const
type Currency = (typeof CURRENCIES)[number]

const RATES_USD: Record<Currency, number> = {
  USD: 1, CLP: 934, EUR: 0.92, GBP: 0.79, JPY: 149.5, ARS: 870, BRL: 4.97,
}

const FLAGS: Record<Currency, string> = {
  CLP: '🇨🇱', USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', ARS: '🇦🇷', BRL: '🇧🇷',
}

const NAMES: Record<Currency, string> = {
  CLP: 'Peso chileno', USD: 'Dólar', EUR: 'Euro',
  GBP: 'Libra esterlina', JPY: 'Yen japonés', ARS: 'Peso argentino', BRL: 'Real brasileño',
}

/* Fake 7-day trend data (multipliers relative to current rate) */
const TREND: Record<Currency, number[]> = {
  CLP: [0.98, 0.99, 1.01, 0.99, 1.00, 1.02, 1.00],
  USD: [1.01, 1.00, 0.99, 1.01, 1.00, 0.99, 1.00],
  EUR: [0.99, 1.01, 1.02, 1.01, 1.00, 0.98, 1.00],
  GBP: [1.00, 1.01, 0.98, 1.00, 1.02, 1.01, 1.00],
  JPY: [0.97, 0.98, 1.00, 1.02, 1.01, 0.99, 1.00],
  ARS: [0.95, 0.97, 0.96, 0.99, 1.02, 1.01, 1.00],
  BRL: [1.01, 0.99, 1.00, 1.01, 0.98, 1.00, 1.00],
}

const INSIGHTS: Partial<Record<Currency, string[]>> = {
  EUR: [
    'Pagar en euros locales suele ser más barato que en tu moneda.',
    'Los cajeros del aeropuerto cobran hasta un 8% extra.',
  ],
  JPY: [
    'Japón es principalmente efectivo. Retira en el aeropuerto.',
    'Los 7-Eleven ATMs aceptan tarjetas internacionales sin comisión.',
  ],
  GBP: [
    'Evita las casas de cambio del aeropuerto Heathrow.',
    'Revolut ofrece la mejor tasa para libras esterlinas.',
  ],
  ARS: [
    'El tipo de cambio oficial difiere mucho del paralelo.',
    'Llevar dólares en efectivo puede ser ventajoso.',
  ],
  BRL: [
    'Mastercard suele dar mejor tasa que Visa en Brasil.',
  ],
}

/* ── Helpers ─────────────────────────────────────────── */
function convert(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount
  return (amount / RATES_USD[from]) * RATES_USD[to]
}

function fmt(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency', currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === 'JPY' || currency === 'CLP' || currency === 'ARS' ? 0 : 2,
  }).format(amount)
}

/* ── Mini sparkline ──────────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 0.01
  const w = 80, h = 32, pad = 3

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  })

  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.75}
      />
      <circle
        cx={points[points.length - 1]!.split(',')[0]}
        cy={points[points.length - 1]!.split(',')[1]}
        r="2.5"
        fill={color}
      />
    </svg>
  )
}

/* ── Currency selector ───────────────────────────────── */
function CurrencyPicker({
  value,
  onChange,
  exclude,
}: {
  value: Currency
  onChange: (c: Currency) => void
  exclude: Currency
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2"
        style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 12,
          padding: '8px 12px',
        }}
      >
        <span style={{ fontSize: 20 }}>{FLAGS[value]}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#EDE9E0' }}>{value}</span>
        <ChevronDown size={14} color="#7A7A84" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-20"
            style={{
              backgroundColor: '#18181D',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              overflow: 'hidden',
              minWidth: 180,
              boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
            }}
          >
            {CURRENCIES.filter((c) => c !== exclude).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { onChange(c); setOpen(false) }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left"
                style={{
                  backgroundColor: c === value ? 'rgba(196,168,106,0.1)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span style={{ fontSize: 18 }}>{FLAGS[c]}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#EDE9E0' }}>{c}</p>
                  <p style={{ fontSize: 11, color: '#7A7A84' }}>{NAMES[c]}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Quick amounts ───────────────────────────────────── */
const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000, 50000]

/* ── Main screen ─────────────────────────────────────── */
export function CurrencyScreen() {
  const [from, setFrom] = useState<Currency>('CLP')
  const [to, setTo] = useState<Currency>('USD')
  const [rawAmount, setRawAmount] = useState('100000')
  const [favorites, setFavorites] = useState<Set<Currency>>(new Set(['USD', 'EUR']))

  const amount = parseFloat(rawAmount.replace(',', '.')) || 0
  const result = useMemo(() => convert(amount, from, to), [amount, from, to])

  const trend = TREND[to]
  const weekChange = ((trend[trend.length - 1]! - trend[0]!) / trend[0]!) * 100
  const trendUp = weekChange >= 0

  const insights = INSIGHTS[to] ?? []

  const toggleFav = (c: Currency) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(c) ? next.delete(c) : next.add(c)
      return next
    })
  }

  const swap = () => {
    setFrom(to)
    setTo(from)
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: '#09090B' }}>
      <div className="px-5 pt-14 pb-6 space-y-5">

        {/* ── Header ──────────────────────────────── */}
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#EDE9E0', letterSpacing: '-0.5px', margin: 0 }}>
            Monedas
          </h1>
          <p style={{ fontSize: 14, color: '#7A7A84', marginTop: 4 }}>
            Tasas en tiempo real · Actualizado hoy
          </p>
        </div>

        {/* ── Converter card ───────────────────────── */}
        <div
          style={{
            backgroundColor: '#111115',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 24,
            overflow: 'visible',
            position: 'relative',
          }}
        >
          {/* Amount input */}
          <div className="px-5 pt-5 pb-4">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#4A4A52', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Convertidor
            </p>

            <input
              type="number"
              inputMode="decimal"
              value={rawAmount}
              onChange={(e) => setRawAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent outline-none text-center"
              style={{ fontSize: 56, fontWeight: 800, color: '#EDE9E0', lineHeight: 1 }}
            />

            {/* Quick amounts */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setRawAmount(q.toString())}
                  className="shrink-0 px-3 py-1.5 rounded-chip text-xs font-semibold"
                  style={{
                    backgroundColor: Number(rawAmount) === q ? '#C4A86A' : 'rgba(255,255,255,0.06)',
                    color: Number(rawAmount) === q ? '#09090B' : '#7A7A84',
                    border: Number(rawAmount) === q ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {q.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />

          {/* From / swap / to */}
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex-1">
              <p style={{ fontSize: 11, color: '#4A4A52', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>De</p>
              <CurrencyPicker value={from} onChange={setFrom} exclude={to} />
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.84, rotate: 180 }}
              transition={{ duration: 0.22 }}
              onClick={swap}
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                backgroundColor: 'rgba(196,168,106,0.1)',
                border: '1px solid rgba(196,168,106,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 18,
                boxShadow: '0 0 16px rgba(196,168,106,0.15)',
              }}
            >
              <ArrowLeftRight size={16} color="#C4A86A" />
            </motion.button>

            <div className="flex-1">
              <p style={{ fontSize: 11, color: '#4A4A52', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>A</p>
              <CurrencyPicker value={to} onChange={setTo} exclude={from} />
            </div>
          </div>

          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />

          {/* Result */}
          <div className="px-5 py-5">
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(196,168,106,0.12) 0%, rgba(27,98,122,0.08) 100%)',
                border: '1px solid rgba(196,168,106,0.18)',
                borderRadius: 18,
                padding: '18px 20px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 13, color: '#7A7A84', marginBottom: 6 }}>
                {fmt(amount, from)} equivale a
              </p>
              <p style={{ fontSize: 36, fontWeight: 800, color: '#C4A86A', lineHeight: 1 }}>
                {fmt(result, to)}
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                {trendUp
                  ? <TrendingUp size={13} color="#2E7D52" />
                  : <TrendingDown size={13} color="#C84040" />}
                <span style={{ fontSize: 12, color: trendUp ? '#2E7D52' : '#C84040', fontWeight: 600 }}>
                  {trendUp ? '+' : ''}{weekChange.toFixed(2)}% esta semana
                </span>
                <Sparkline data={trend} color={trendUp ? '#2E7D52' : '#C84040'} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Insights ────────────────────────────── */}
        {insights.length > 0 && (
          <div className="space-y-2">
            {insights.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  backgroundColor: '#111115',
                  border: '1px solid rgba(196,168,106,0.12)',
                  borderRadius: 16,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <Info size={15} color="#C4A86A" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: '#EDE9E0', lineHeight: 1.5 }}>{tip}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bank fee warning */}
        <div
          style={{
            backgroundColor: 'rgba(200,64,64,0.07)',
            border: '1px solid rgba(200,64,64,0.18)',
            borderRadius: 16,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <AlertCircle size={15} color="#C84040" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: '#EDE9E0', lineHeight: 1.5 }}>
            Tu banco puede cobrar entre un <strong style={{ color: '#C84040' }}>2–4%</strong> de comisión adicional. El monto real puede diferir.
          </p>
        </div>

        {/* ── Favorites / Watchlist ────────────────── */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#4A4A52', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Tabla de cambio
          </p>
          <div
            style={{
              backgroundColor: '#111115',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            {CURRENCIES.map((c, i) => {
              const rateVsFrom = convert(1, c, from)
              const trend7 = TREND[c]
              const chg = ((trend7[trend7.length - 1]! - trend7[0]!) / trend7[0]!) * 100
              const up = chg >= 0
              const isFav = favorites.has(c)

              return (
                <div key={c}>
                  {i > 0 && <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 68 }} />}
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{FLAGS[c]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#EDE9E0' }}>{c}</p>
                      <p style={{ fontSize: 12, color: '#7A7A84' }}>{NAMES[c]}</p>
                    </div>

                    <Sparkline data={trend7} color={up ? '#2E7D52' : '#C84040'} />

                    <div style={{ textAlign: 'right', minWidth: 80 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#EDE9E0', tabularNums: true } as React.CSSProperties}>
                        {c === from ? '1.00' : fmt(rateVsFrom, from)}
                      </p>
                      <p style={{ fontSize: 11, color: up ? '#2E7D52' : '#C84040', fontWeight: 600, marginTop: 1 }}>
                        {up ? '▲' : '▼'} {Math.abs(chg).toFixed(2)}%
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFav(c)}
                      style={{ flexShrink: 0, padding: 4 }}
                    >
                      <Star
                        size={16}
                        color={isFav ? '#C4A86A' : '#4A4A52'}
                        fill={isFav ? '#C4A86A' : 'none'}
                      />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Tip calculator ───────────────────────── */}
        <div
          style={{
            backgroundColor: '#111115',
            border: '1px solid rgba(27,98,122,0.2)',
            borderRadius: 20,
            padding: '16px 20px',
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 700, color: '#1B627A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Calculadora de propina
          </p>
          <div className="flex gap-2">
            {[10, 15, 18, 20, 25].map((pct) => {
              const tip = (amount * pct) / 100
              return (
                <div
                  key={pct}
                  className="flex-1 text-center py-3 rounded-2xl"
                  style={{
                    backgroundColor: 'rgba(27,98,122,0.1)',
                    border: '1px solid rgba(27,98,122,0.15)',
                  }}
                >
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1B627A' }}>{pct}%</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#EDE9E0', marginTop: 2 }}>
                    {fmt(tip, from)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
