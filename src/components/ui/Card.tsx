import { motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'

type Variant = 'default' | 'elevated' | 'interactive'

interface CardProps {
  variant?: Variant
  padding?: string
  onClick?: () => void
  children: ReactNode
  className?: string
  style?: CSSProperties
}

const variantStyles: Record<Variant, { className: string; shadow: string }> = {
  default: {
    className: 'shadow-card',
    shadow: '',
  },
  elevated: {
    className: 'shadow-elevated',
    shadow: '',
  },
  interactive: {
    className: 'shadow-card cursor-pointer',
    shadow: '',
  },
}

export function Card({
  variant = 'default',
  padding = 'p-5',
  onClick,
  children,
  className = '',
  style,
}: CardProps) {
  const base =
    'bg-bg-surface rounded-card border border-border-subtle font-sans'

  if (variant === 'interactive') {
    return (
      <motion.div
        onClick={onClick}
        style={style}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={[base, variantStyles.interactive.className, padding, className]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      style={style}
      onClick={onClick}
      className={[base, variantStyles[variant].className, padding, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
