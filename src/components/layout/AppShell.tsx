import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send } from 'lucide-react'
import { BottomNav } from './BottomNav'

const AI_SUGGESTIONS = [
  '¿Cuánto debería presupuestar para Tokio?',
  '¿Cuánto gasté esta semana?',
  '¿Cuál es la mejor forma de pagar en Europa?',
  'Resume mis gastos del viaje',
]

function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: '¡Hola! Soy tu asistente de viaje. ¿En qué te puedo ayudar hoy?' },
  ])

  const send = (text: string) => {
    if (!text.trim()) return
    setMessages((prev) => [
      ...prev,
      { role: 'user', text },
      {
        role: 'ai',
        text: 'Esta función estará disponible pronto con integración de IA real. ¡Estamos trabajando en ello!',
      },
    ])
    setInput('')
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed z-40 flex items-center justify-center"
        style={{
          bottom: 82,
          right: 20,
          width: 50,
          height: 50,
          borderRadius: 17,
          background: 'linear-gradient(135deg, #C4A86A 0%, #8A6030 100%)',
          boxShadow: '0 0 24px rgba(196,168,106,0.45), 0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        <Sparkles size={21} color="white" strokeWidth={1.8} />
      </motion.button>

      {/* Drawer */}
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
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 right-0 bottom-0 z-50 flex flex-col"
              style={{
                backgroundColor: '#111115',
                borderRadius: '28px 28px 0 0',
                border: '1px solid rgba(255,255,255,0.07)',
                borderBottom: 'none',
                maxHeight: '75vh',
                paddingBottom: 'env(safe-area-inset-bottom)',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)' }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #C4A86A 0%, #8A6030 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sparkles size={17} color="white" />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#EDE9E0' }}>Roami AI</p>
                    <p style={{ fontSize: 11, color: '#C4A86A' }}>Asistente de viaje</p>
                  </div>
                </div>
                <button type="button" onClick={() => setOpen(false)}>
                  <X size={20} color="#4A4A52" />
                </button>
              </div>

              <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 no-scrollbar">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '10px 14px',
                        borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        backgroundColor: msg.role === 'user' ? '#C4A86A' : 'rgba(255,255,255,0.07)',
                        color: msg.role === 'user' ? '#09090B' : '#EDE9E0',
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Quick suggestions */}
                {messages.length === 1 && (
                  <div className="space-y-2 pt-2">
                    {AI_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="w-full text-left px-4 py-3 rounded-2xl text-sm"
                        style={{
                          backgroundColor: 'rgba(196,168,106,0.07)',
                          border: '1px solid rgba(196,168,106,0.15)',
                          color: '#EDE9E0',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send(input)}
                  placeholder="Pregúntale a Roami AI..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{
                    color: '#EDE9E0',
                    padding: '10px 14px',
                    borderRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => send(input)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: '#C4A86A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Send size={17} color="#09090B" strokeWidth={2.5} />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export function AppShell() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: '#09090B', color: '#EDE9E0', minHeight: '100vh' }}
    >
      <main
        className="overflow-y-auto"
        style={{ paddingBottom: 'calc(62px + env(safe-area-inset-bottom))' }}
      >
        <Outlet />
      </main>

      <AIAssistant />
      <BottomNav />
    </div>
  )
}
