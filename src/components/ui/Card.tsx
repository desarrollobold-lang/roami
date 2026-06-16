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

const baseStyle: CSSProperties = {
  backgroundColor: '#172118',
  border: '1px solid #1E3022',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
}

export function Card({
  variant = 'default',
  padding = 'p-5',
  onClick,
  children,
  className = '',
  style,
}: CardProps) {
  if (variant === 'interactive') {
    return (
      <motion.div
        onClick={onClick}
        style={{ ...baseStyle, cursor: 'pointer', ...style }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={['font-sans', padding, className].filter(Boolean).join(' ')}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      style={{ ...baseStyle, ...style }}
      onClick={onClick}
      className={['font-sans', padding, className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}
