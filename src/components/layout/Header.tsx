import { ArrowLeft, MoreHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface HeaderProps {
  title?: string
  showBack?: boolean
  rightAction?: ReactNode
  transparent?: boolean
}

export function Header({ title, showBack = false, rightAction, transparent = false }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className="sticky top-0 z-40 flex items-center h-14 px-4 gap-3 glass"
      style={{
        backgroundColor: transparent ? 'transparent' : 'rgba(9,9,11,0.85)',
        borderBottom: transparent ? 'none' : '1px solid rgba(255,255,255,0.06)',
        paddingTop: 'env(safe-area-inset-top)',
        backdropFilter: transparent ? 'none' : 'blur(20px)',
        WebkitBackdropFilter: transparent ? 'none' : 'blur(20px)',
      }}
    >
      {showBack && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-full"
          style={{
            color: '#EDE9E0',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <ArrowLeft size={19} strokeWidth={2} />
        </button>
      )}

      {title && (
        <h1
          className="flex-1 truncate"
          style={{ fontSize: 17, fontWeight: 700, color: '#EDE9E0' }}
        >
          {title}
        </h1>
      )}

      {!title && <div className="flex-1" />}

      {rightAction ?? (
        <button
          type="button"
          className="flex items-center justify-center w-9 h-9 rounded-full"
          style={{ color: '#4A4A52' }}
        >
          <MoreHorizontal size={20} />
        </button>
      )}
    </header>
  )
}
