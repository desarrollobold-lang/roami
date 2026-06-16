import { motion, AnimatePresence } from 'framer-motion'
import { Home, Map, Coins, Users, User, type LucideIcon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

interface NavItem {
  label: string
  icon: LucideIcon
  path: string
  match: (p: string) => boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio',   icon: Home,  path: '/home',                        match: (p) => p === '/home' },
  { label: 'Viajes',   icon: Map,   path: '/trips',                       match: (p) => p === '/trips' || p.startsWith('/trips/') },
  { label: 'IA',       icon: Coins, path: '/currency',                    match: (p) => p === '/currency' },
  { label: 'Split',    icon: Users, path: '/trips/mock-trip-1/split',     match: (p) => p.includes('/split') },
  { label: 'Perfil',   icon: User,  path: '/profile',                     match: (p) => p === '/profile' },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const activeIndex = NAV_ITEMS.findIndex((item) => item.match(pathname))

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-stretch z-50 glass"
      style={{
        backgroundColor: 'rgba(11,20,16,0.92)',
        borderTop: '1px solid #1E3022',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV_ITEMS.map((item, index) => {
        const isActive = index === activeIndex
        const Icon = item.icon
        const isCurrency = index === 2

        if (isCurrency) {
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className="relative flex flex-1 flex-col items-center justify-center"
              style={{ minHeight: 62 }}
            >
              <motion.div
                whileTap={{ scale: 0.88 }}
                transition={{ duration: 0.12 }}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isActive ? '#C9A84B' : 'rgba(201,168,75,0.1)',
                  border: isActive ? 'none' : '1px solid rgba(201,168,75,0.18)',
                  boxShadow: isActive ? '0 0 20px rgba(201,168,75,0.35)' : 'none',
                  marginBottom: 2,
                  transition: 'all 0.25s ease',
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  color={isActive ? '#0B1410' : '#C9A84B'}
                />
              </motion.div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: isActive ? '#C9A84B' : '#7A8C78',
                  letterSpacing: '0.03em',
                  transition: 'color 0.2s',
                }}
              >
                {item.label}
              </span>
            </button>
          )
        }

        return (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className="relative flex flex-1 flex-col items-center justify-center pt-3 pb-2 gap-1"
            style={{ minHeight: 62 }}
          >
            <motion.div
              animate={{
                filter: isActive ? 'drop-shadow(0 0 7px rgba(201,168,75,0.65))' : 'none',
              }}
              transition={{ duration: 0.2 }}
            >
              <Icon
                size={21}
                strokeWidth={isActive ? 2.2 : 1.6}
                color={isActive ? '#C9A84B' : '#7A8C78'}
                style={{ transition: 'color 0.2s' }}
              />
            </motion.div>

            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#C9A84B' : '#7A8C78',
                letterSpacing: '0.03em',
                transition: 'color 0.2s',
                lineHeight: 1,
              }}
            >
              {item.label}
            </span>

            <AnimatePresence>
              {isActive && (
                <motion.span
                  layoutId="nav-dot"
                  className="absolute bottom-1.5"
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: '#C9A84B',
                    boxShadow: '0 0 6px rgba(201,168,75,0.8)',
                  }}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.18 }}
                />
              )}
            </AnimatePresence>
          </button>
        )
      })}
    </nav>
  )
}
