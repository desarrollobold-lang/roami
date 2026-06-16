import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ChipProps {
  label: string
  selected?: boolean
  onPress?: () => void
  icon?: ReactNode
  className?: string
}

export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  className = '',
}: ChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className={[
        'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-chip text-sm font-medium',
        'transition-colors duration-200 cursor-pointer select-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        selected
          ? {
              backgroundColor: 'rgba(201,168,75,0.15)',
              color: '#C9A84B',
              border: '1px solid rgba(201,168,75,0.4)',
              boxShadow: '0 0 12px rgba(201,168,75,0.25)',
            }
          : {
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#7A8C78',
              border: '1px solid #1E3022',
            }
      }
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </motion.button>
  )
}
