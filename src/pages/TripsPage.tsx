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

/* ── Mock data (shown when there are no real trips yet) ── */
const MOCK_TRIP: Trip = {
  id: 'mock-trip-1', name: 'Europa 2026',
  destination: 'París · Roma · Florencia',
  start_date: '2026-05-15', end_date: '2026-06-10',
  currency: 'EUR', budget: 2000,
  user_id: 'mock', created_at: new Date().toISOString(),
}

const RECENT_EXPENSES = [
  { id: 'r1', icon: UtensilsCrossed, label: 'Cena Roma',    amount: 85,  color: '#C4A86A' },
  { id: 'r2', icon: Train,           label: 'Tren París',   amount: 210, color: '#1B627A' },
  { id: 'r3', icon: Plane,           label: 'Vuelo BCN-CDG',amount: 180, color: '#8A6ACF' },
]

const SPLIT_STATUS = [
  { name: 'Diego', owes: true,  amount: 21.25 },
  { name: 'María', owes: false, amount: 18.50 },
]

const MOCK_SPENT = 675

/* ── Sub-components ──────────────────────────────────── */
function GlassCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: '#111115', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 22, overflow: 'hidden', ...style }}>
      {children}
    </div>
  )
}

function SectionLabel({ label, action, onAction }: { label: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <p style={{ fontSize: 12, fontWeight: 700, color: '#4A4A52', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </p>
      {action && onAction && (
        <button type="button" onClick={onAction} style={{ fontSize: 12, color: '#C4A86A', fontWeight: 600 }}>
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
  const TRIP_IMAGE = 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&q=80'

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      onClick={onPress}
      style={{ borderRadius: 24, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 16px 48px rgba(0,0,0,0.6)', position: 'relative', height: 220 }}
    >
      <img src={TRIP_IMAGE} alt={trip.name} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,11,0.95) 0%, rgba(9,9,11,0.5) 55%, rgba(9,9,11,0.1) 100%)' }} />

      {/* Active pill */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5">
        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
          style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#2E7D52' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#EDE9E0', backgroundColor: 'rgba(9,9,11,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)' }}>
          Viaje activo
        </span>
      </div>
      <div className="absolute top-4 right-4"><ChevronRight size={20} color="rgba(255,255,255,0.5)" /></div>

      <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          <MapPin size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          {trip.destination ?? 'Sin destino'}
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#EDE9E0', margin: '2px 0 10px', lineHeight: 1.1 }}>
          {trip.name}
        </h2>

        {budget > 0 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                {trip.start_date ? `${trip.start_date} → ${trip.end_date ?? '?'}` : trip.currency}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#C4A86A' }}>
                {remaining !== null ? `${trip.currency} ${remaining.toLocaleString()} restante` : ''}
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 2, background: pct > 0.8 ? 'linear-gradient(90deg,#C84040,#E05252)' : 'linear-gradient(90deg,#C4A86A,#D4BA7C)' }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{trip.currency} {spent.toLocaleString()} gastado</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>de {trip.currency} {budget.toLocaleString()}</span>
            </div>
          </>
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
        background: 'linear-gradient(135deg, rgba(196,168,106,0.07) 0%, rgba(27,98,122,0.05) 100%)',
        border: '1px dashed rgba(196,168,106,0.2)',
        borderRadius: 24,
        padding: 28,
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: 32, marginBottom: 10 }}>✈️</p>
      <p style={{ fontSize: 16, fontWeight: 700, color: '#EDE9E0', marginBottom: 6 }}>
        Tu próxima aventura te espera
      </p>
      <p style={{ fontSize: 13, color: '#7A7A84', lineHeight: 1.5, marginBottom: 20 }}>
        Creá tu primer viaje para empezar a organizar gastos, itinerario y splits.
      </p>
      <motion.button
        whileTap={{ scale: 0.96 }}
        type="button"
        onClick={onCreate}
        className="flex items-center gap-2 mx-auto font-bold"
        style={{
          backgroundColor: '#C4A86A', color: '#09090B',
          borderRadius: 14, padding: '12px 22px', fontSize: 14,
          boxShadow: '0 0 24px rgba(196,168,106,0.35)',
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
          <p style={{ fontSize: 11, fontWeight: 700, color: '#4A4A52', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Conversor rápido
          </p>
          <span style={{ fontSize: 11, color: '#4A4A52' }}>Tasa estimada</span>
        </div>
        <div className="flex items-center gap-3">
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-1.5 mb-1">
              <span style={{ fontSize: 16 }}>{FLAGS[from]}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7A7A84' }}>{from}</span>
            </div>
            <input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent outline-none font-bold" style={{ fontSize: 22, color: '#EDE9E0' }} />
          </div>
          <motion.button type="button" whileTap={{ scale: 0.85, rotate: 180 }} transition={{ duration: 0.22 }} onClick={swap}
            style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(196,168,106,0.1)', border: '1px solid rgba(196,168,106,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowLeftRight size={15} color="#C4A86A" />
          </motion.button>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div className="flex items-center gap-1.5 mb-1 justify-end">
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7A7A84' }}>{to}</span>
              <span style={{ fontSize: 16 }}>{FLAGS[to]}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#C4A86A' }}>{fmt(result, to)}</p>
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

  /* ── Load trips ───────────────────────────────────── */
  useEffect(() => {
    async function load() {
      /* Supabase with authenticated user */
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
      /* Guest / demo: localStorage trips */
      const stored = JSON.parse(localStorage.getItem('roami_trips') ?? '[]') as Trip[]
      setTrips(stored)
      setTripsLoading(false)
    }
    void load()
  }, [user])

  const activeTrip = trips[0] ?? MOCK_TRIP
  const showMock = trips.length === 0

  const quickActions = [
    { icon: <ArrowLeftRight size={18} />, label: 'Convertir', accent: '#C4A86A', path: '/currency' },
    { icon: <Receipt size={18} />,        label: 'Gasto',     accent: '#1B627A', path: '/trips/mock-trip-1/expenses' },
    { icon: <Users size={18} />,          label: 'Split',     accent: '#8A6ACF', path: '/trips/mock-trip-1/split' },
    { icon: <CalendarDays size={18} />,   label: 'Plan',      accent: '#3F6A48', path: '/trips/mock-trip-1/itinerary' },
  ]

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: '#09090B' }}>
      {/* ── Header ──────────────────────────────── */}
      <div className="px-5 pt-14 pb-6" style={{ background: 'linear-gradient(180deg, rgba(196,168,106,0.06) 0%, rgba(9,9,11,0) 100%)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontSize: 14, color: '#7A7A84', marginBottom: 2 }}>{greeting} 👋</p>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#EDE9E0', margin: 0, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              {displayName}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <MapPin size={12} color="#C4A86A" />
              <span style={{ fontSize: 13, color: '#7A7A84' }}>Buenos Aires · 18°C</span>
            </div>
          </div>

          {/* Avatar → profile */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => navigate('/profile')}
            style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #C4A86A 0%, #8A6030 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(196,168,106,0.25)', position: 'relative' }}
          >
            <span style={{ fontSize: 17, fontWeight: 800, color: 'white' }}>{initial}</span>
            {/* Guest badge */}
            {!user && (
              <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 9, backgroundColor: '#1B627A', color: 'white', borderRadius: 6, padding: '1px 5px', fontWeight: 700, border: '1.5px solid #09090B' }}>
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
            style={{ backgroundColor: 'rgba(27,98,122,0.1)', border: '1px solid rgba(27,98,122,0.2)' }}
          >
            <p style={{ fontSize: 13, color: '#EDE9E0' }}>
              Modo invitado — los datos no se sincronizan
            </p>
            <button type="button" onClick={() => navigate('/login')}
              style={{ fontSize: 12, color: '#C4A86A', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 8 }}>
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
            <div style={{ height: 220, borderRadius: 24, backgroundColor: '#111115', animation: 'pulse 1.5s infinite' }} />
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
                style={{ backgroundColor: '#111115', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: `${a.accent}18`, border: `1px solid ${a.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.accent }}>
                  {a.icon}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#7A7A84' }}>{a.label}</span>
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
                    <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: s.owes ? 'rgba(46,125,82,0.15)' : 'rgba(200,64,64,0.15)', border: `1px solid ${s.owes ? 'rgba(46,125,82,0.3)' : 'rgba(200,64,64,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: s.owes ? '#2E7D52' : '#C84040' }}>
                      {s.name[0]}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#EDE9E0' }}>
                        {s.owes ? `${s.name} te debe` : `Le debés a ${s.name}`}
                      </p>
                      <p style={{ fontSize: 11, color: '#7A7A84', marginTop: 1 }}>Europa 2026</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 17, fontWeight: 800, color: s.owes ? '#2E7D52' : '#C84040' }}>
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
                  {i > 0 && <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 64 }} />}
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: `${exp.color}18`, border: `1px solid ${exp.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={17} color={exp.color} strokeWidth={1.8} />
                    </div>
                    <p style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#EDE9E0' }}>{exp.label}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#EDE9E0' }}>€{exp.amount}</p>
                  </div>
                </div>
              )
            })}
          </GlassCard>
        </div>

        {/* ── Insight ──────────────────────────────── */}
        <GlassCard style={{ background: 'linear-gradient(135deg, rgba(196,168,106,0.1) 0%, rgba(27,98,122,0.08) 100%)', border: '1px solid rgba(196,168,106,0.15)' }}>
          <div className="flex items-start gap-4 p-4">
            <div style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(196,168,106,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={19} color="#C4A86A" strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#C4A86A', marginBottom: 3 }}>Insight de Roami AI</p>
              <p style={{ fontSize: 13, color: '#EDE9E0', lineHeight: 1.5 }}>
                Llevas el <strong>33.7%</strong> del presupuesto en <strong>comida</strong>. Por encima del promedio.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* ── My Trips list (when real trips exist) ── */}
        {trips.length > 0 && (
          <div>
            <SectionLabel label="Mis viajes" action="+ Nuevo" onAction={() => setCreateOpen(true)} />
            <div className="space-y-2">
              {trips.map((t) => (
                <motion.button key={t.id} type="button" whileTap={{ scale: 0.98 }} onClick={() => navigate(`/trips/${t.id}/expenses`)}
                  className="w-full flex items-center gap-4 text-left"
                  style={{ backgroundColor: '#111115', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '14px 16px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(196,168,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Wallet size={20} color="#C4A86A" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#EDE9E0' }} className="truncate">{t.name}</p>
                    <p style={{ fontSize: 12, color: '#7A7A84', marginTop: 2 }}>{t.destination ?? t.currency}</p>
                  </div>
                  <ChevronRight size={16} color="#4A4A52" />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ── Stats strip ──────────────────────────── */}
        <div className="flex gap-3 pb-4">
          {[
            { icon: <Wallet size={16} color="#C4A86A" />, label: 'Total gastado', value: '€675' },
            { icon: <TrendingUp size={16} color="#1B627A" />, label: 'vs semana ant.', value: '+12%' },
          ].map((s) => (
            <GlassCard key={s.label} style={{ flex: 1 }}>
              <div className="flex items-center gap-3 p-4">
                <div style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#4A4A52' }}>{s.label}</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#EDE9E0' }}>{s.value}</p>
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
