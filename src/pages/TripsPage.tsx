import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeftRight, Plus, ChevronRight, MapPin,
  Receipt, Users, CalendarDays, TrendingUp, Wallet,
  UtensilsCrossed, Train, Plane,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { CreateTripSheet } from '../features/trips/CreateTripSheet'
import type { Trip } from '../types/expenses'

/* ── Currency helpers ────────────────────────────────── */
type Currency = 'CLP' | 'USD' | 'EUR' | 'GBP' | 'JPY'
const RATES: Record<Currency, number> = { USD: 1, CLP: 934, EUR: 0.92, GBP: 0.79, JPY: 149.5 }
const FLAGS: Record<Currency, string> = { CLP: '🇨🇱', USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵' }

function convert(amount: number, from: Currency, to: Currency) {
  return (amount / RATES[from]) * RATES[to]
}
function fmt(amount: number, c: Currency) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency', currency: c,
    minimumFractionDigits: 0, maximumFractionDigits: c === 'JPY' ? 0 : 2,
  }).format(amount)
}

/* ── Mock data ───────────────────────────────────────── */
const MOCK_TRIP: Trip = {
  id: 'mock-trip-1', name: 'Europa 2026',
  destination: 'París · Roma · Florencia',
  start_date: '2026-05-15', end_date: '2026-06-10',
  currency: 'EUR', budget: 2000,
  user_id: 'mock', created_at: new Date().toISOString(),
}

const RECENT_EXPENSES = [
  { id: 'r1', icon: UtensilsCrossed, label: 'Cena Roma',     amount: 85,  color: '#C9A84B' },
  { id: 'r2', icon: Train,           label: 'Tren París',    amount: 210, color: '#5BAA7A' },
  { id: 'r3', icon: Plane,           label: 'Vuelo BCN-CDG', amount: 180, color: '#7A8C78' },
]

const SPLIT_STATUS = [
  { name: 'Diego', owes: true,  amount: 21.25 },
  { name: 'María', owes: false, amount: 18.50 },
]

const MOCK_SPENT = 675

/* ── Trip time-progress helper ───────────────────────── */
function tripProgress(start?: string, end?: string): { pct: number; label: string } | null {
  if (!start || !end) return null
  const now   = Date.now()
  const s     = new Date(start + 'T00:00:00').getTime()
  const e     = new Date(end + 'T23:59:59').getTime()
  if (now < s) return { pct: 0, label: 'Planificando' }
  if (now > e) return { pct: 1, label: 'Completado' }
  return { pct: (now - s) / (e - s), label: 'En progreso' }
}

/* ── Sub-components ──────────────────────────────────── */
function GlassCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: '#172118', border: '1px solid #1E3022', borderRadius: 22, overflow: 'hidden', ...style }}>
      {children}
    </div>
  )
}

function SectionLabel({ label, action, onAction }: { label: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <p style={{ fontSize: 12, fontWeight: 700, color: '#7A8C78', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </p>
      {action && onAction && (
        <button type="button" onClick={onAction} style={{ fontSize: 12, color: '#C9A84B', fontWeight: 600 }}>
          {action}
        </button>
      )}
    </div>
  )
}

/* ── Trip hero card ──────────────────────────────────── */
function TripHeroCard({ trip, spent, onPress }: { trip: Trip; spent: number; onPress: () => void }) {
  const budget = trip.budget ?? 0
  const pct = budget > 0 ? Math.min(spent / budget, 1) : 0
  const remaining = budget > 0 ? budget - spent : null
  const timeProg = tripProgress(trip.start_date, trip.end_date)
  const TRIP_IMAGE = 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&q=80'

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      onClick={onPress}
      style={{ borderRadius: 24, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 16px 48px rgba(0,0,0,0.6)', position: 'relative', height: 240 }}
    >
      <img src={TRIP_IMAGE} alt={trip.name} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(11,20,16,0.97) 0%, rgba(11,20,16,0.5) 55%, rgba(11,20,16,0.1) 100%)' }} />

      {/* Active pill */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5">
        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
          style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#5BAA7A' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#F2EDE4', backgroundColor: 'rgba(11,20,16,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', padding: '3px 10px', borderRadius: 999, border: '1px solid #1E3022' }}>
          Viaje activo
        </span>
      </div>
      <div className="absolute top-4 right-4"><ChevronRight size={20} color="rgba(255,255,255,0.4)" /></div>

      <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
        {/* Destination chip */}
        <div className="flex items-center gap-1.5 mb-1">
          <MapPin size={10} color="#5BAA7A" />
          <span style={{ fontSize: 12, color: '#5BAA7A', backgroundColor: 'rgba(91,170,122,0.12)', border: '1px solid rgba(91,170,122,0.25)', padding: '2px 8px', borderRadius: 999 }}>
            {trip.destination ?? 'Sin destino'}
          </span>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: '#F2EDE4', margin: '2px 0 10px', lineHeight: 1.1, fontFamily: 'Fraunces, serif' }}>
          {trip.name}
        </h2>

        {budget > 0 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 12, color: '#7A8C78' }}>
                {trip.start_date ? `${trip.start_date} → ${trip.end_date ?? '?'}` : trip.currency}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#C9A84B' }}>
                {remaining !== null ? `${trip.currency} ${remaining.toLocaleString()} restante` : ''}
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 2, backgroundColor: '#1E3022', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 2, backgroundColor: pct > 0.8 ? '#C97070' : '#C9A84B' }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span style={{ fontSize: 11, color: '#7A8C78' }}>{trip.currency} {spent.toLocaleString()} gastado</span>
              <span style={{ fontSize: 11, color: '#7A8C78' }}>de {trip.currency} {budget.toLocaleString()}</span>
            </div>
          </>
        )}

        {/* Trip time progress */}
        {timeProg && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontSize: 11, color: '#7A8C78' }}>{timeProg.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#C9A84B' }}>{Math.round(timeProg.pct * 100)}%</span>
            </div>
            <div style={{ height: 3, borderRadius: 2, backgroundColor: '#1E3022', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${timeProg.pct * 100}%` }}
                transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 2, backgroundColor: '#C9A84B' }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ── Empty trips state ───────────────────────────────── */
function EmptyTrips({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, rgba(201,168,75,0.06) 0%, rgba(91,170,122,0.04) 100%)',
        border: '1px dashed rgba(201,168,75,0.2)',
        borderRadius: 24,
        padding: 28,
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: 32, marginBottom: 10 }}>✈️</p>
      <p style={{ fontSize: 16, fontWeight: 700, color: '#F2EDE4', marginBottom: 6, fontFamily: 'Fraunces, serif' }}>
        Tu próxima aventura te espera
      </p>
      <p style={{ fontSize: 13, color: '#7A8C78', lineHeight: 1.5, marginBottom: 20 }}>
        Creá tu primer viaje para empezar a organizar gastos, itinerario y splits.
      </p>
      <motion.button
        whileTap={{ scale: 0.96 }}
        type="button"
        onClick={onCreate}
        className="flex items-center gap-2 mx-auto font-semibold"
        style={{
          backgroundColor: '#C9A84B', color: '#0B1410',
          borderRadius: 14, padding: '12px 22px', fontSize: 14,
          boxShadow: '0 0 24px rgba(201,168,75,0.3)',
        }}
      >
        <Plus size={16} strokeWidth={2.5} />
        Crear primer viaje
      </motion.button>
    </motion.div>
  )
}

/* ── Mini Converter ──────────────────────────────────── */
function MiniConverter() {
  const [from, setFrom] = useState<Currency>('CLP')
  const [to, setTo]     = useState<Currency>('EUR')
  const [amount, setAmount] = useState('100000')
  const result = useMemo(() => convert(parseFloat(amount.replace(',', '.')) || 0, from, to), [amount, from, to])
  const swap = () => { setFrom(to); setTo(from) }

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p style={{ fontSize: 11, fontWeight: 700, color: '#7A8C78', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Conversor rápido
          </p>
          <span style={{ fontSize: 11, color: '#7A8C78' }}>Tasa estimada</span>
        </div>
        <div className="flex items-center gap-3">
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-1.5 mb-1">
              <span style={{ fontSize: 16 }}>{FLAGS[from]}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7A8C78' }}>{from}</span>
            </div>
            <input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent outline-none font-bold" style={{ fontSize: 22, color: '#F2EDE4', fontFamily: 'Fraunces, serif' }} />
          </div>
          <motion.button type="button" whileTap={{ scale: 0.85, rotate: 180 }} transition={{ duration: 0.22 }} onClick={swap}
            style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(201,168,75,0.1)', border: '1px solid rgba(201,168,75,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowLeftRight size={15} color="#C9A84B" />
          </motion.button>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div className="flex items-center gap-1.5 mb-1 justify-end">
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7A8C78' }}>{to}</span>
              <span style={{ fontSize: 16 }}>{FLAGS[to]}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#C9A84B', fontFamily: 'Fraunces, serif' }}>{fmt(result, to)}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

/* ── Main ────────────────────────────────────────────── */
export function TripsPage() {
  const navigate = useNavigate()
  const { user, displayName, initial } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripsLoading, setTripsLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  useEffect(() => {
    async function load() {
      if (supabase && user) {
        const { data } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        setTrips((data as Trip[]) ?? [])
        setTripsLoading(false)
        return
      }
      const stored = JSON.parse(localStorage.getItem('roami_trips') ?? '[]') as Trip[]
      setTrips(stored)
      setTripsLoading(false)
    }
    void load()
  }, [user])

  const activeTrip = trips[0] ?? MOCK_TRIP
  const showMock = trips.length === 0

  const quickActions = [
    { icon: <ArrowLeftRight size={18} />, label: 'Convertir', accent: '#C9A84B', path: '/currency' },
    { icon: <Receipt size={18} />,        label: 'Gasto',     accent: '#5BAA7A', path: '/trips/mock-trip-1/expenses' },
    { icon: <Users size={18} />,          label: 'Split',     accent: '#7A8C78', path: '/trips/mock-trip-1/split' },
    { icon: <CalendarDays size={18} />,   label: 'Plan',      accent: '#5BAA7A', path: '/trips/mock-trip-1/itinerary' },
  ]

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: '#0B1410' }}>
      {/* ── Header ──────────────────────────────── */}
      <div className="px-5 pt-14 pb-6" style={{ background: 'linear-gradient(180deg, rgba(201,168,75,0.05) 0%, rgba(11,20,16,0) 100%)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontSize: 14, color: '#7A8C78', marginBottom: 2 }}>{greeting} 👋</p>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: '#F2EDE4', margin: 0, letterSpacing: '-0.5px', lineHeight: 1.1, fontFamily: 'Fraunces, serif' }}>
              {displayName}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <MapPin size={12} color="#C9A84B" />
              <span style={{ fontSize: 13, color: '#7A8C78' }}>Buenos Aires · 18°C</span>
            </div>
          </div>

          {/* Avatar → profile */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => navigate('/profile')}
            style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#C9A84B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(201,168,75,0.2)', position: 'relative' }}
          >
            <span style={{ fontSize: 17, fontWeight: 700, color: '#0B1410', fontFamily: 'Fraunces, serif' }}>{initial}</span>
            {!user && (
              <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 9, backgroundColor: '#5BAA7A', color: 'white', borderRadius: 6, padding: '1px 5px', fontWeight: 700, border: '1.5px solid #0B1410' }}>
                guest
              </span>
            )}
          </motion.button>
        </div>

        {/* Guest mode banner */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{ backgroundColor: 'rgba(91,170,122,0.07)', border: '1px solid rgba(91,170,122,0.15)' }}
          >
            <p style={{ fontSize: 13, color: '#F2EDE4' }}>
              Modo invitado — los datos no se sincronizan
            </p>
            <button type="button" onClick={() => navigate('/login')}
              style={{ fontSize: 12, color: '#C9A84B', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 8 }}>
              Iniciar sesión →
            </button>
          </motion.div>
        )}
      </div>

      <div className="px-5 space-y-6">
        {/* ── Active Trip ─────────────────────────── */}
        <div>
          <SectionLabel
            label={showMock ? 'Demo de viaje' : 'Viaje activo'}
            action="+ Nuevo viaje"
            onAction={() => setCreateOpen(true)}
          />
          {tripsLoading ? (
            <div style={{ height: 240, borderRadius: 24, backgroundColor: '#172118', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <TripHeroCard
              trip={activeTrip}
              spent={MOCK_SPENT}
              onPress={() => navigate(`/trips/${activeTrip.id}/expenses`)}
            />
          )}
        </div>

        {/* ── No trips CTA ────────────────────────── */}
        {!tripsLoading && trips.length === 0 && (
          <EmptyTrips onCreate={() => setCreateOpen(true)} />
        )}

        {/* ── Quick Actions ───────────────────────── */}
        <div>
          <SectionLabel label="Acciones rápidas" />
          <div className="flex gap-3">
            {quickActions.map((a) => (
              <motion.button key={a.label} type="button" whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }} onClick={() => navigate(a.path)}
                className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl"
                style={{ backgroundColor: '#172118', border: '1px solid #1E3022' }}>
                <div style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: `${a.accent}18`, border: `1px solid ${a.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.accent }}>
                  {a.icon}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#7A8C78' }}>{a.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Mini Converter ──────────────────────── */}
        <div>
          <SectionLabel label="Conversor" action="Ver más →" onAction={() => navigate('/currency')} />
          <MiniConverter />
        </div>

        {/* ── Split Status ─────────────────────────── */}
        <div>
          <SectionLabel label="Split status" action="Ver todo →" onAction={() => navigate('/trips/mock-trip-1/split')} />
          <div className="space-y-2">
            {SPLIT_STATUS.map((s) => (
              <GlassCard key={s.name}>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: s.owes ? 'rgba(91,170,122,0.12)' : 'rgba(201,112,112,0.12)', border: `1px solid ${s.owes ? 'rgba(91,170,122,0.25)' : 'rgba(201,112,112,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: s.owes ? '#5BAA7A' : '#C97070' }}>
                      {s.name[0]}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#F2EDE4' }}>
                        {s.owes ? `${s.name} te debe` : `Le debés a ${s.name}`}
                      </p>
                      <p style={{ fontSize: 11, color: '#7A8C78', marginTop: 1 }}>Europa 2026</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 17, fontWeight: 700, color: s.owes ? '#5BAA7A' : '#C97070', fontFamily: 'Fraunces, serif' }}>
                    {s.owes ? '+' : '-'}€{s.amount.toFixed(2)}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* ── Recent Expenses ──────────────────────── */}
        <div>
          <SectionLabel label="Gastos recientes" action="Ver todo →" onAction={() => navigate('/trips/mock-trip-1/expenses')} />
          <GlassCard>
            {RECENT_EXPENSES.map((exp, i) => {
              const Icon = exp.icon
              return (
                <div key={exp.id}>
                  {i > 0 && <div style={{ height: 1, backgroundColor: '#1E3022', marginLeft: 64 }} />}
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: `${exp.color}18`, border: `1px solid ${exp.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={17} color={exp.color} strokeWidth={1.8} />
                    </div>
                    <p style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#F2EDE4' }}>{exp.label}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#C9A84B', fontFamily: 'Fraunces, serif' }}>€{exp.amount}</p>
                  </div>
                </div>
              )
            })}
          </GlassCard>
        </div>

        {/* ── Insight ──────────────────────────────── */}
        <GlassCard style={{ background: 'linear-gradient(135deg, rgba(201,168,75,0.08) 0%, rgba(91,170,122,0.05) 100%)', border: '1px solid rgba(201,168,75,0.15)' }}>
          <div className="flex items-start gap-4 p-4">
            <div style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(201,168,75,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={19} color="#C9A84B" strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#C9A84B', marginBottom: 3 }}>Insight de Yuki AI</p>
              <p style={{ fontSize: 13, color: '#F2EDE4', lineHeight: 1.5 }}>
                Llevas el <strong>33.7%</strong> del presupuesto en <strong>comida</strong>. Por encima del promedio.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* ── My Trips list ── */}
        {trips.length > 0 && (
          <div>
            <SectionLabel label="Mis viajes" action="+ Nuevo" onAction={() => setCreateOpen(true)} />
            <div className="space-y-2">
              {trips.map((t) => (
                <motion.button key={t.id} type="button" whileTap={{ scale: 0.98 }} onClick={() => navigate(`/trips/${t.id}/expenses`)}
                  className="w-full flex items-center gap-4 text-left"
                  style={{ backgroundColor: '#172118', border: '1px solid #1E3022', borderRadius: 18, padding: '14px 16px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(201,168,75,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Wallet size={20} color="#C9A84B" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#F2EDE4', fontFamily: 'Fraunces, serif' }} className="truncate">{t.name}</p>
                    <p style={{ fontSize: 12, color: '#7A8C78', marginTop: 2 }}>{t.destination ?? t.currency}</p>
                  </div>
                  <ChevronRight size={16} color="#7A8C78" />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ── Stats strip ──────────────────────────── */}
        <div className="flex gap-3 pb-4">
          {[
            { icon: <Wallet size={16} color="#C9A84B" />, label: 'Total gastado', value: '€675' },
            { icon: <TrendingUp size={16} color="#5BAA7A" />, label: 'vs semana ant.', value: '+12%' },
          ].map((s) => (
            <GlassCard key={s.label} style={{ flex: 1 }}>
              <div className="flex items-center gap-3 p-4">
                <div style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(30,48,34,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#7A8C78' }}>{s.label}</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#F2EDE4', fontFamily: 'Fraunces, serif' }}>{s.value}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* ── Create Trip Sheet ─────────────────────── */}
      <CreateTripSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(t) => setTrips((prev) => [t, ...prev])}
      />
    </div>
  )
}
