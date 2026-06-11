import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Globe, Bell, Shield, CreditCard, Moon, ChevronRight,
  LogOut, Coins, MapPin, Star, Gift,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const CURRENCIES = ['USD', 'EUR', 'CLP', 'GBP', 'JPY', 'ARS', 'BRL']

interface SettingRowProps {
  icon: React.ReactNode
  label: string
  value?: string
  onPress?: () => void
  danger?: boolean
  toggle?: boolean
  toggleValue?: boolean
  onToggle?: (v: boolean) => void
}

function SettingRow({
  icon, label, value, onPress, danger = false, toggle, toggleValue, onToggle,
}: SettingRowProps) {
  return (
    <motion.button
      type="button"
      whileTap={onPress || onToggle ? { scale: 0.98 } : undefined}
      onClick={onPress}
      className="flex items-center gap-4 w-full text-left"
      style={{ padding: '14px 20px', cursor: onPress || onToggle ? 'pointer' : 'default' }}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: danger ? 'rgba(200,64,64,0.1)' : 'rgba(196,168,106,0.08)',
          border: `1px solid ${danger ? 'rgba(200,64,64,0.18)' : 'rgba(196,168,106,0.12)'}`,
        }}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <span
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: danger ? '#C84040' : '#EDE9E0',
          }}
        >
          {label}
        </span>
      </div>

      {toggle ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle?.(!toggleValue) }}
          style={{
            width: 46,
            height: 26,
            borderRadius: 999,
            backgroundColor: toggleValue ? '#C4A86A' : 'rgba(255,255,255,0.1)',
            position: 'relative',
            transition: 'background-color 0.2s',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <motion.div
            animate={{ x: toggleValue ? 22 : 2 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 3,
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: 'white',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          />
        </button>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          {value && (
            <span style={{ fontSize: 13, color: '#7A7A84' }}>{value}</span>
          )}
          {onPress && <ChevronRight size={16} color="#4A4A52" />}
        </div>
      )}
    </motion.button>
  )
}

function SectionTitle({ label }: { label: string }) {
  return (
    <p
      className="px-5 pt-6 pb-2"
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: '#4A4A52',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </p>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: '#111115',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  )
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, displayName, initial, signOut } = useAuth()

  const [currency, setCurrency] = useState('USD')
  const [language, setLanguage] = useState('Español')
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [offlineMode, setOfflineMode] = useState(false)
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/splash', { replace: true })
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: '#09090B' }}>
      {/* Hero profile */}
      <div
        className="relative px-5 pt-14 pb-8"
        style={{
          background:
            'linear-gradient(180deg, rgba(196,168,106,0.08) 0%, rgba(9,9,11,0) 100%)',
        }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #C4A86A 0%, #8A6030 100%)',
              boxShadow: '0 0 24px rgba(196,168,106,0.3)',
              fontSize: 28,
              fontWeight: 800,
              color: 'white',
            }}
          >
            {user ? initial : <User size={32} color="white" strokeWidth={1.5} />}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#EDE9E0', margin: 0 }}>
              {displayName}
            </h1>
            <p style={{ fontSize: 14, color: '#7A7A84', marginTop: 3 }}>
              {user ? user.email : 'Modo invitado'}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <Star size={12} color="#C4A86A" fill="#C4A86A" />
              <span style={{ fontSize: 12, color: '#C4A86A', fontWeight: 600 }}>
                Explorador nivel 1
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mt-6">
          {[
            { label: 'Viajes', value: '3' },
            { label: 'Países', value: '7' },
            { label: 'Gastos', value: '48' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-1 text-center py-3 rounded-2xl"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <p style={{ fontSize: 20, fontWeight: 700, color: '#EDE9E0' }}>{stat.value}</p>
              <p style={{ fontSize: 11, color: '#7A7A84', marginTop: 2 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Login CTA — only shown in guest mode */}
        {!user && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 w-full mt-4 font-semibold text-white"
            style={{
              height: 50,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #C4A86A 0%, #9A7A40 100%)',
              boxShadow: '0 0 28px rgba(196,168,106,0.3)',
              fontSize: 15,
              color: '#09090B',
            }}
          >
            <User size={17} strokeWidth={2} />
            Crear cuenta / Iniciar sesión
          </motion.button>
        )}
      </div>

      <div className="px-4">
        {/* Preferences */}
        <SectionTitle label="Preferencias" />
        <Section>
          <SettingRow
            icon={<Coins size={18} color="#C4A86A" />}
            label="Moneda base"
            value={currency}
            onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
          />
          {showCurrencyPicker && (
            <div
              className="flex flex-wrap gap-2 px-4 pb-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setCurrency(c); setShowCurrencyPicker(false) }}
                  className="px-3 py-1.5 rounded-chip text-sm font-semibold"
                  style={{
                    backgroundColor: c === currency ? '#C4A86A' : 'rgba(255,255,255,0.06)',
                    color: c === currency ? '#09090B' : '#EDE9E0',
                    marginTop: 8,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <SettingRow
            icon={<Globe size={18} color="#1B627A" />}
            label="Idioma"
            value={language}
            onPress={() => setLanguage(language === 'Español' ? 'English' : 'Español')}
          />
          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <SettingRow
            icon={<MapPin size={18} color="#C4A86A" />}
            label="Región"
            value="América del Sur"
            onPress={() => {}}
          />
        </Section>

        {/* App */}
        <SectionTitle label="Aplicación" />
        <Section>
          <SettingRow
            icon={<Bell size={18} color="#C4A86A" />}
            label="Notificaciones"
            toggle
            toggleValue={notifications}
            onToggle={setNotifications}
          />
          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <SettingRow
            icon={<Moon size={18} color="#1B627A" />}
            label="Modo oscuro"
            toggle
            toggleValue={darkMode}
            onToggle={setDarkMode}
          />
          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <SettingRow
            icon={<Globe size={18} color="#3F6A48" />}
            label="Modo sin conexión"
            toggle
            toggleValue={offlineMode}
            onToggle={setOfflineMode}
          />
        </Section>

        {/* Account */}
        <SectionTitle label="Cuenta" />
        <Section>
          <SettingRow
            icon={<CreditCard size={18} color="#C4A86A" />}
            label="Métodos de pago"
            onPress={() => {}}
          />
          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <SettingRow
            icon={<Shield size={18} color="#1B627A" />}
            label="Seguridad"
            onPress={() => {}}
          />
          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <SettingRow
            icon={<Gift size={18} color="#8A6ACF" />}
            label="Invitar amigos"
            onPress={() => {}}
          />
        </Section>

        {/* Danger zone */}
        <SectionTitle label="Sesión" />
        <Section>
          <SettingRow
            icon={<LogOut size={18} color="#C84040" />}
            label={user ? 'Cerrar sesión' : 'Iniciar sesión'}
            danger={!!user}
            onPress={user ? handleSignOut : () => navigate('/login')}
          />
        </Section>

        {/* Version */}
        <p
          className="text-center mt-6"
          style={{ fontSize: 12, color: '#4A4A52' }}
        >
          Roami v0.1.0 · Made with ♡ for travelers
        </p>
      </div>
    </div>
  )
}
