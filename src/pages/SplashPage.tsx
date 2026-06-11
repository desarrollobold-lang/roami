import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      const onboarded = localStorage.getItem('roami_onboarded')
      navigate(onboarded ? '/home' : '/onboarding', { replace: true })
    }, 2600)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#09090B' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,168,106,0.07) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(27,98,122,0.06) 0%, transparent 70%)',
          top: '30%',
          left: '65%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Logo group */}
      <motion.div
        initial={{ opacity: 0, scale: 0.82, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6"
      >
        {/* Mark */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 26,
            background: 'linear-gradient(140deg, #D4BA7C 0%, #A8843E 100%)',
            boxShadow: '0 0 48px rgba(196,168,106,0.45), 0 16px 40px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <path
              d="M21 7 L35 35 M21 7 L7 35 M11 27 L31 27"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="21" cy="21" r="2.5" fill="white" />
          </svg>
        </div>

        {/* Wordmark */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, letterSpacing: '0.3em' }}
            animate={{ opacity: 1, letterSpacing: '-0.02em' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: '#EDE9E0',
              margin: 0,
              lineHeight: 1,
            }}
          >
            Roami
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
            style={{
              fontSize: 15,
              color: '#7A7A84',
              marginTop: 10,
              letterSpacing: '0.04em',
              fontWeight: 400,
            }}
          >
            Travel smarter. Spend better.
          </motion.p>
        </div>
      </motion.div>

      {/* Pulsing dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-16 flex gap-2 items-center"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#C4A86A',
            }}
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
    </div>
  )
}
