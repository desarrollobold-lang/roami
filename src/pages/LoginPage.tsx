import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, enterGuestMode } = useAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Completá todos los campos.'); return }
    setLoading(true)
    setError(null)
    const { error: authError } = await signIn(email, password)
    setLoading(false)
    if (authError) { setError(authError); return }
    navigate('/home', { replace: true })
  }

  const handleGoogle = async () => {
    setError(null)
    const { error: authError } = await signInWithGoogle()
    if (authError) setError(authError)
  }

  const handleGuest = () => {
    enterGuestMode()
    navigate('/home', { replace: true })
  }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-y-auto"
      style={{ backgroundColor: '#09090B' }}
    >
      {/* Background glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,168,106,0.07) 0%, transparent 70%)',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Logo area */}
      <div className="flex flex-col items-center pt-20 pb-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3 mb-10"
        >
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: 20,
              background: 'linear-gradient(140deg, #D4BA7C 0%, #A8843E 100%)',
              boxShadow: '0 0 36px rgba(196,168,106,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 42 42" fill="none">
              <path d="M21 7 L35 35 M21 7 L7 35 M11 27 L31 27" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="21" cy="21" r="2.5" fill="white" />
            </svg>
          </div>
          <div className="text-center">
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#EDE9E0', margin: 0, letterSpacing: '-0.4px' }}>
              Bienvenido de vuelta
            </h1>
            <p style={{ fontSize: 14, color: '#7A7A84', marginTop: 5 }}>
              Iniciá sesión en tu cuenta Roami
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm space-y-3"
        >
          {/* Email */}
          <div
            style={{
              backgroundColor: '#111115',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '4px 4px 4px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Mail size={17} color="#4A4A52" style={{ flexShrink: 0 }} />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null) }}
              placeholder="tu@email.com"
              className="flex-1 bg-transparent outline-none py-3.5"
              style={{ fontSize: 15, color: '#EDE9E0' }}
            />
          </div>

          {/* Password */}
          <div
            style={{
              backgroundColor: '#111115',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '4px 4px 4px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Lock size={17} color="#4A4A52" style={{ flexShrink: 0 }} />
            <input
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              placeholder="Contraseña"
              className="flex-1 bg-transparent outline-none py-3.5"
              style={{ fontSize: 15, color: '#EDE9E0' }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              style={{ padding: '10px 12px', color: '#4A4A52' }}
            >
              {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
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

          {/* Forgot password */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              style={{ fontSize: 13, color: '#C4A86A', fontWeight: 600 }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 font-bold"
            style={{
              height: 54,
              borderRadius: 16,
              background: loading
                ? 'rgba(196,168,106,0.4)'
                : 'linear-gradient(135deg, #D4BA7C 0%, #A8843E 100%)',
              color: '#09090B',
              fontSize: 16,
              boxShadow: loading ? 'none' : '0 0 28px rgba(196,168,106,0.35)',
              cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? (
              <span style={{ opacity: 0.7 }}>Iniciando sesión...</span>
            ) : (
              <>
                Iniciar sesión
                <ArrowRight size={18} strokeWidth={2.5} />
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 12, color: '#4A4A52' }}>o continúa con</span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Google */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 font-semibold"
            style={{
              height: 54,
              borderRadius: 16,
              backgroundColor: '#111115',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#EDE9E0',
              fontSize: 15,
            }}
          >
            <Chrome size={19} color="#EDE9E0" />
            Continuar con Google
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 12, color: '#4A4A52' }}>o sin cuenta</span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Guest mode */}
          <button
            type="button"
            onClick={handleGuest}
            className="w-full font-semibold"
            style={{
              height: 54,
              borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#7A7A84',
              fontSize: 14,
            }}
          >
            Explorar sin cuenta
          </button>
        </motion.form>

        {/* Register link */}
        <p className="mt-8 text-center" style={{ fontSize: 14, color: '#7A7A84' }}>
          ¿No tenés cuenta?{' '}
          <Link to="/register" style={{ color: '#C4A86A', fontWeight: 700 }}>
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  )
}
