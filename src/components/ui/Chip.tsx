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
        'transition-colors duration-200 cursor-pointer select-none border',
        selected
          ? 'bg-accent-purple text-text-primary border-accent-purple'
          : 'text-text-secondary border-border-subtle hover:border-border-default',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        selected
          ? { boxShadow: '0 0 20px rgba(103,76,191,0.4)' }
          : { backgroundColor: 'rgba(255,255,255,0.06)' }
      }
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </motion.button>
  )
}
