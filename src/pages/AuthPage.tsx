import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function AuthPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Completá todos los campos.'); return }
    setLoading(true)
    setError(null)

    try {
      const result = mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, email.split('@')[0])

      if (result.error) { setError(result.error); return }
      navigate('/home', { replace: true })
    } catch {
      setError('Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'))
    setError(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center overflow-y-auto"
      style={{ backgroundColor: '#0B1410' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          backgroundColor: '#172118',
          borderRadius: 20,
          border: '1px solid #1E3022',
          padding: 32,
          width: '100%',
          maxWidth: 380,
          margin: '24px 16px',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 style={{ fontSize: 36, fontWeight: 700, color: '#F2EDE4', margin: 0, fontFamily: 'Fraunces, serif' }}>
            Yuki
          </h1>
          <p style={{ fontSize: 14, color: '#7A8C78', marginTop: 6 }}>Tu compañero de viaje</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email */}
          <div style={fieldStyle}>
            <Mail size={16} color="#7A8C78" style={{ flexShrink: 0 }} />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null) }}
              placeholder="tu@email.com"
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 15, color: '#F2EDE4' }}
            />
          </div>

          {/* Password */}
          <div style={fieldStyle}>
            <Lock size={16} color="#7A8C78" style={{ flexShrink: 0 }} />
            <input
              type={showPwd ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              placeholder="Contraseña"
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 15, color: '#F2EDE4' }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              style={{ color: '#7A8C78', padding: '0 4px', display: 'flex', alignItems: 'center' }}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  fontSize: 13,
                  color: '#C97070',
                  backgroundColor: 'rgba(201,112,112,0.08)',
                  border: '1px solid rgba(201,112,112,0.2)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  margin: 0,
                }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Primary action */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full font-semibold"
            style={{
              height: 52,
              borderRadius: 14,
              backgroundColor: loading ? 'rgba(201,168,75,0.4)' : '#C9A84B',
              color: '#0B1410',
              fontSize: 15,
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </motion.button>

          {/* Toggle mode */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={toggleMode}
            className="w-full font-medium"
            style={{
              height: 52,
              borderRadius: 14,
              backgroundColor: 'transparent',
              border: '1px solid #1E3022',
              color: '#7A8C78',
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            {mode === 'login' ? 'Crear cuenta' : 'Ya tengo cuenta'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  backgroundColor: '#0B1410',
  border: '1px solid #1E3022',
  borderRadius: 14,
  padding: '0 16px',
  height: 52,
}
