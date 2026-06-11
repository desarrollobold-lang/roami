import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    id: 0,
    title: 'All your travel\nin one place',
    subtitle: 'Trips, expenses, and plans — organized for the way you explore the world.',
    accent: '#1B627A',
    accentGlow: 'rgba(27,98,122,0.35)',
    gradient: 'linear-gradient(170deg, rgba(27,98,122,0.55) 0%, rgba(9,9,11,0) 55%)',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  },
  {
    id: 1,
    title: 'Convert currencies\nin real time',
    subtitle: 'Live rates, smart insights, and fee warnings — never lose money on exchange again.',
    accent: '#C4A86A',
    accentGlow: 'rgba(196,168,106,0.35)',
    gradient: 'linear-gradient(170deg, rgba(100,72,30,0.60) 0%, rgba(9,9,11,0) 55%)',
    image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&q=80',
  },
  {
    id: 2,
    title: 'Track expenses &\nsplit bills',
    subtitle: 'Know exactly what you spent and who owes what. Beautiful. Automatic. Stress-free.',
    accent: '#3F6A48',
    accentGlow: 'rgba(63,106,72,0.35)',
    gradient: 'linear-gradient(170deg, rgba(24,52,30,0.65) 0%, rgba(9,9,11,0) 55%)',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
  },
  {
    id: 3,
    title: 'Travel smarter\nwith AI',
    subtitle: 'Your intelligent travel companion. Ask anything, plan smarter, spend better.',
    accent: '#8A6ACF',
    accentGlow: 'rgba(138,106,207,0.35)',
    gradient: 'linear-gradient(170deg, rgba(42,28,72,0.65) 0%, rgba(9,9,11,0) 55%)',
    image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80',
  },
]

export function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()
  const slide = SLIDES[current]!

  const finish = () => {
    localStorage.setItem('roami_onboarded', '1')
    navigate('/home', { replace: true })
  }

  const handleNext = () => {
    if (current < SLIDES.length - 1) setCurrent(current + 1)
    else finish()
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor: '#09090B' }}>
      {/* Gradient background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`grad-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
          style={{ background: slide.gradient }}
        />
      </AnimatePresence>

      {/* Hero image — top 58% */}
      <div
        className="absolute top-0 left-0 right-0 overflow-hidden"
        style={{ height: '58%' }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={`img-${current}`}
            src={slide.image}
            alt=""
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 0.45, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        {/* Fade bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(9,9,11,0.1) 0%, rgba(9,9,11,0.7) 70%, #09090B 100%)',
          }}
        />
      </div>

      {/* Skip */}
      <div className="absolute top-14 right-6 z-10">
        <button
          type="button"
          onClick={finish}
          className="text-sm font-medium px-4 py-2 rounded-chip"
          style={{
            color: '#7A7A84',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          Saltar
        </button>
      </div>

      {/* Content — bottom */}
      <div
        className="absolute left-0 right-0 bottom-0 flex flex-col px-6 pb-14"
        style={{ paddingTop: '52%' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${current}`}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <h1
              style={{
                fontSize: 38,
                fontWeight: 800,
                color: '#EDE9E0',
                lineHeight: 1.12,
                letterSpacing: '-0.5px',
                margin: 0,
                whiteSpace: 'pre-line',
              }}
            >
              {slide.title}
            </h1>
            <p
              style={{
                fontSize: 16,
                color: '#7A7A84',
                lineHeight: 1.65,
                marginTop: 14,
              }}
            >
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === current ? 28 : 6, opacity: i === current ? 1 : 0.3 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                height: 6,
                borderRadius: 999,
                backgroundColor: i === current ? slide.accent : '#EDE9E0',
                cursor: 'pointer',
              }}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.button
          type="button"
          onClick={handleNext}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.1 }}
          className="flex items-center justify-center gap-2 w-full font-bold text-white"
          style={{
            height: 58,
            borderRadius: 18,
            fontSize: 17,
            backgroundColor: slide.accent,
            boxShadow: `0 0 32px ${slide.accentGlow}, 0 8px 24px rgba(0,0,0,0.5)`,
          }}
        >
          {current === SLIDES.length - 1 ? 'Empezar' : 'Siguiente'}
          <ChevronRight size={21} strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  )
}
