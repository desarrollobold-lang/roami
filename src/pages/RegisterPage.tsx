import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Chrome } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle } = useAuth()

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  const validate = () => {
    if (!name.trim())  return 'Ingresá tu nombre.'
    if (!email)        return 'Ingresá tu email.'
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.'
    if (password !== confirm) return 'Las contraseñas no coinciden.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setLoading(true)
    setError(null)
    const { error: authError } = await signUp(email, password, name)
    setLoading(false)
    if (authError) { setError(authError); return }
    setSuccess(true)
    setTimeout(() => navigate('/home', { replace: true }), 1800)
  }

  const handleGoogle = async () => {
    setError(null)
    const { error: authError } = await signInWithGoogle()
    if (authError) setError(authError)
  }

  if (success) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ backgroundColor: '#09090B' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4 px-8 text-center"
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: 'rgba(46,125,82,0.15)',
              border: '1px solid rgba(46,125,82,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
            }}
          >
            ✓
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#EDE9E0', margin: 0 }}>
            ¡Cuenta creada!
          </h2>
          <p style={{ fontSize: 14, color: '#7A7A84' }}>
            Revisá tu email para confirmar tu cuenta. Redirigiendo...
          </p>
        </motion.div>
      </div>
    )
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
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(27,98,122,0.08) 0%, transparent 70%)',
          top: '15%',
          right: '-10%',
        }}
      />

      <div className="flex flex-col items-center pt-16 pb-10 px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3 mb-8 text-center"
        >
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: 20,
              background: 'linear-gradient(140deg, #D4BA7C 0%, #A8843E 100%)',
              boxShadow: '0 0 36px rgba(196,168,106,0.35)',
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
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#EDE9E0', margin: 0, letterSpacing: '-0.4px' }}>
            Crear cuenta
          </h1>
          <p style={{ fontSize: 14, color: '#7A7A84' }}>
            Empezá a viajar mejor con Roami
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm space-y-3"
        >
          {/* Name */}
          <FieldWrapper icon={<User size={17} color="#4A4A52" />}>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null) }}
              placeholder="Tu nombre"
              className="flex-1 bg-transparent outline-none py-3.5"
              style={{ fontSize: 15, color: '#EDE9E0' }}
            />
          </FieldWrapper>

          {/* Email */}
          <FieldWrapper icon={<Mail size={17} color="#4A4A52" />}>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null) }}
              placeholder="tu@email.com"
              className="flex-1 bg-transparent outline-none py-3.5"
              style={{ fontSize: 15, color: '#EDE9E0' }}
            />
          </FieldWrapper>

          {/* Password */}
          <FieldWrapper icon={<Lock size={17} color="#4A4A52" />}>
            <input
              type={showPwd ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              placeholder="Contraseña (mín. 6 caracteres)"
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
          </FieldWrapper>

          {/* Confirm password */}
          <FieldWrapper icon={<Lock size={17} color="#4A4A52" />}>
            <input
              type={showPwd ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(null) }}
              placeholder="Repetir contraseña"
              className="flex-1 bg-transparent outline-none py-3.5"
              style={{ fontSize: 15, color: '#EDE9E0' }}
            />
          </FieldWrapper>

          {/* Password strength */}
          {password.length > 0 && (
            <PasswordStrength password={password} />
          )}

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
            {loading ? 'Creando cuenta...' : (
              <>
                Crear cuenta
                <ArrowRight size={18} strokeWidth={2.5} />
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
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

          {/* Terms */}
          <p style={{ fontSize: 11, color: '#4A4A52', textAlign: 'center', lineHeight: 1.5, marginTop: 8 }}>
            Al crear una cuenta aceptás nuestros{' '}
            <span style={{ color: '#C4A86A' }}>Términos de uso</span>{' '}
            y{' '}
            <span style={{ color: '#C4A86A' }}>Política de privacidad</span>.
          </p>
        </motion.form>

        {/* Login link */}
        <p className="mt-6 text-center" style={{ fontSize: 14, color: '#7A7A84' }}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" style={{ color: '#C4A86A', fontWeight: 700 }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

/* ── Field wrapper ─────────────────────────────────────── */
function FieldWrapper({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
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
      <div style={{ flexShrink: 0 }}>{icon}</div>
      {children}
    </div>
  )
}

/* ── Password strength indicator ──────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 6,
    password.length >= 10,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const labels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte']
  const colors = ['#C84040', '#C84040', '#C4A86A', '#C4A86A', '#2E7D52']

  return (
    <div>
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor: i <= score ? colors[score - 1] : 'rgba(255,255,255,0.08)',
              transition: 'background-color 0.2s',
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: 11, color: score > 0 ? colors[score - 1] : '#4A4A52', fontWeight: 600 }}>
        {score > 0 ? labels[score - 1] : ''}
      </p>
    </div>
  )
}
