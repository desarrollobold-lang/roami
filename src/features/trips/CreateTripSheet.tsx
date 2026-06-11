import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, MapPin, Calendar, Wallet, ChevronDown, Check,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Trip } from '../../types/expenses'

/* ── Constants ────────────────────────────────────────── */
const CURRENCIES = [
  { code: 'USD', flag: '🇺🇸', name: 'Dólar' },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
  { code: 'CLP', flag: '🇨🇱', name: 'Peso chileno' },
  { code: 'GBP', flag: '🇬🇧', name: 'Libra esterlina' },
  { code: 'JPY', flag: '🇯🇵', name: 'Yen japonés' },
  { code: 'ARS', flag: '🇦🇷', name: 'Peso argentino' },
  { code: 'BRL', flag: '🇧🇷', name: 'Real brasileño' },
  { code: 'MXN', flag: '🇲🇽', name: 'Peso mexicano' },
]

/* Destination suggestions */
const POPULAR_DESTINATIONS = [
  'París, Francia', 'Roma, Italia', 'Tokio, Japón', 'Nueva York, EE.UU.',
  'Barcelona, España', 'Bangkok, Tailandia', 'Buenos Aires, Argentina',
  'Lisboa, Portugal', 'Dubái, Emiratos', 'Cancún, México',
]

/* ── Types ────────────────────────────────────────────── */
interface CreateTripSheetProps {
  open: boolean
  onClose: () => void
  onCreated: (trip: Trip) => void
}

/* ── Component ────────────────────────────────────────── */
export function CreateTripSheet({ open, onClose, onCreated }: CreateTripSheetProps) {
  const { user } = useAuth()

  const [name, setName]               = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate]     = useState('')
  const [endDate, setEndDate]         = useState('')
  const [currency, setCurrency]       = useState('USD')
  const [budget, setBudget]           = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const [destFocus, setDestFocus]     = useState(false)

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0]!
  const filteredSuggestions = destination.length > 1
    ? POPULAR_DESTINATIONS.filter((d) => d.toLowerCase().includes(destination.toLowerCase()))
    : []

  const reset = () => {
    setName(''); setDestination(''); setStartDate(''); setEndDate('')
    setCurrency('USD'); setBudget(''); setError(null); setLoading(false)
    setShowCurrencyPicker(false)
  }

  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('El nombre del viaje es obligatorio.'); return }
    setLoading(true)
    setError(null)

    const newTrip: Omit<Trip, 'id' | 'created_at'> = {
      name: name.trim(),
      destination: destination.trim() || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      currency,
      budget: budget ? parseFloat(budget) : undefined,
      user_id: user?.id ?? 'guest',
    }

    /* ── Supabase path ──────────────────────────────── */
    if (supabase && user) {
      const { data, error: insertError } = await supabase
        .from('trips')
        .insert(newTrip)
        .select()
        .single()

      setLoading(false)
      if (insertError) { setError(insertError.message); return }
      onCreated(data as Trip)
      reset()
      onClose()
      return
    }

    /* ── Local / guest path ─────────────────────────── */
    const localTrip: Trip = {
      ...newTrip,
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
    }

    /* Persist in localStorage so it survives refresh */
    const stored = JSON.parse(localStorage.getItem('roami_trips') ?? '[]') as Trip[]
    localStorage.setItem('roami_trips', JSON.stringify([localTrip, ...stored]))

    setLoading(false)
    onCreated(localTrip)
    reset()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed left-0 right-0 bottom-0 z-50 flex flex-col"
            style={{
              backgroundColor: '#111115',
              borderRadius: '28px 28px 0 0',
              border: '1px solid rgba(255,255,255,0.07)',
              borderBottom: 'none',
              maxHeight: '92vh',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#EDE9E0', margin: 0 }}>
                  Nuevo viaje
                </h2>
                <p style={{ fontSize: 13, color: '#7A7A84', marginTop: 2 }}>
                  Completá los detalles de tu aventura
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  width: 36, height: 36, borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={18} color="#7A7A84" />
              </button>
            </div>

            <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />

            {/* Form body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 no-scrollbar">

              {/* Name */}
              <Field label="Nombre del viaje *">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(null) }}
                  placeholder="Ej: Europa 2026, Vacaciones Grecia..."
                  style={inputStyle}
                />
              </Field>

              {/* Destination with autocomplete */}
              <Field label="Destino">
                <div className="relative">
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <MapPin size={16} color="#4A4A52" style={{ position: 'absolute', left: 14 }} />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      onFocus={() => setDestFocus(true)}
                      onBlur={() => setTimeout(() => setDestFocus(false), 150)}
                      placeholder="Ciudad, País"
                      style={{ ...inputStyle, paddingLeft: 40 }}
                    />
                  </div>
                  <AnimatePresence>
                    {destFocus && filteredSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: 4,
                          backgroundColor: '#18181D',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 14,
                          overflow: 'hidden',
                          zIndex: 10,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        }}
                      >
                        {filteredSuggestions.slice(0, 5).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => { setDestination(s); setDestFocus(false) }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-left"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#EDE9E0', fontSize: 14 }}
                          >
                            <MapPin size={13} color="#C4A86A" />
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Field>

              {/* Dates row */}
              <div className="flex gap-3">
                <Field label="Fecha inicio" style={{ flex: 1 }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Calendar size={15} color="#4A4A52" style={{ position: 'absolute', left: 12, pointerEvents: 'none' }} />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{
                        ...inputStyle,
                        paddingLeft: 36,
                        colorScheme: 'dark',
                      }}
                    />
                  </div>
                </Field>
                <Field label="Fecha fin" style={{ flex: 1 }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Calendar size={15} color="#4A4A52" style={{ position: 'absolute', left: 12, pointerEvents: 'none' }} />
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{
                        ...inputStyle,
                        paddingLeft: 36,
                        colorScheme: 'dark',
                      }}
                    />
                  </div>
                </Field>
              </div>

              {/* Currency */}
              <Field label="Moneda principal">
                <button
                  type="button"
                  onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                  className="flex items-center justify-between w-full"
                  style={inputStyle}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 20 }}>{selectedCurrency.flag}</span>
                    <span style={{ fontWeight: 600, color: '#EDE9E0' }}>
                      {selectedCurrency.code}
                    </span>
                    <span style={{ fontSize: 13, color: '#7A7A84' }}>
                      {selectedCurrency.name}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    color="#4A4A52"
                    style={{ transform: showCurrencyPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                  />
                </button>
                <AnimatePresence>
                  {showCurrencyPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden', marginTop: 4 }}
                    >
                      <div
                        style={{
                          backgroundColor: '#18181D',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 14,
                          overflow: 'hidden',
                        }}
                      >
                        {CURRENCIES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => { setCurrency(c.code); setShowCurrencyPicker(false) }}
                            className="flex items-center justify-between w-full px-4 py-3"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                          >
                            <div className="flex items-center gap-3">
                              <span style={{ fontSize: 18 }}>{c.flag}</span>
                              <span style={{ fontSize: 14, fontWeight: 600, color: '#EDE9E0' }}>{c.code}</span>
                              <span style={{ fontSize: 12, color: '#7A7A84' }}>{c.name}</span>
                            </div>
                            {c.code === currency && <Check size={15} color="#C4A86A" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Field>

              {/* Budget */}
              <Field label="Presupuesto total (opcional)">
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Wallet size={15} color="#4A4A52" style={{ position: 'absolute', left: 14 }} />
                  <span
                    style={{
                      position: 'absolute',
                      left: 38,
                      fontSize: 14,
                      color: '#4A4A52',
                      fontWeight: 600,
                    }}
                  >
                    {selectedCurrency.code}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="0"
                    style={{ ...inputStyle, paddingLeft: 72 }}
                  />
                </div>
              </Field>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      fontSize: 13,
                      color: '#C84040',
                      backgroundColor: 'rgba(200,64,64,0.08)',
                      border: '1px solid rgba(200,64,64,0.15)',
                      borderRadius: 12,
                      padding: '10px 14px',
                    }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Footer CTA */}
            <div
              className="px-5 py-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 font-bold"
                style={{
                  height: 56,
                  borderRadius: 18,
                  background: loading
                    ? 'rgba(196,168,106,0.35)'
                    : 'linear-gradient(135deg, #D4BA7C 0%, #A8843E 100%)',
                  color: '#09090B',
                  fontSize: 16,
                  boxShadow: loading ? 'none' : '0 0 28px rgba(196,168,106,0.35)',
                  cursor: loading ? 'default' : 'pointer',
                }}
              >
                {loading ? 'Creando viaje...' : '✈️  Crear viaje'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ── Helpers ──────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#18181D',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: '13px 16px',
  fontSize: 15,
  color: '#EDE9E0',
  outline: 'none',
}

function Field({
  label,
  children,
  style,
}: {
  label: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div style={style}>
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#4A4A52',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          marginBottom: 7,
        }}
      >
        {label}
      </p>
      {children}
    </div>
  )
}
