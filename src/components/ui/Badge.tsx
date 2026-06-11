import type { CSSProperties, ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps {
  variant?: BadgeVariant
  icon?: ReactNode
  children: ReactNode
  className?: string
  style?: CSSProperties
}

const variantStyles: Record<
  BadgeVariant,
  { bg: string; text: string; border: string }
> = {
  default: {
    bg: 'rgba(255,255,255,0.08)',
    text: '#A0A0A8',
    border: 'rgba(255,255,255,0.12)',
  },
  success: {
    bg: 'rgba(63,95,58,0.25)',
    text: '#6DBF65',
    border: 'rgba(63,95,58,0.5)',
  },
  warning: {
    bg: 'rgba(201,164,78,0.2)',
    text: '#C9A44E',
    border: 'rgba(201,164,78,0.4)',
  },
  danger: {
    bg: 'rgba(224,82,82,0.2)',
    text: '#E05252',
    border: 'rgba(224,82,82,0.4)',
  },
  info: {
    bg: 'rgba(24,195,243,0.15)',
    text: '#18C3F3',
    border: 'rgba(24,195,243,0.35)',
  },
}

export function Badge({
  variant = 'default',
  icon,
  children,
  className = '',
  style,
}: BadgeProps) {
  const styles = variantStyles[variant]

  return (
    <span
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
        borderColor: styles.border,
        ...style,
      }}
      className={[
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-chip text-xs font-medium border',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && <span className="shrink-0 [&>svg]:w-3 [&>svg]:h-3">{icon}</span>}
      {children}
    </span>
  )
}
