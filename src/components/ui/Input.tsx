import { useState, type ReactNode, type InputHTMLAttributes } from 'react'

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  onChange?: (value: string) => void
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onChange,
  disabled,
  className = '',
  id,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false)

  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  const borderColor = error ? '#C97070' : focused ? '#C9A84B' : '#1E3022'
  const ringStyle = focused && !error ? { boxShadow: '0 0 0 3px rgba(201,168,75,0.2)' } : {}

  return (
    <div className={['flex flex-col gap-1.5', className].join(' ')}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: 14, fontWeight: 500, color: '#7A8C78' }}
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3.5 pointer-events-none" style={{ color: '#7A8C78' }}>
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange?.(e.target.value)}
          style={{
            width: '100%',
            height: 44,
            backgroundColor: '#0B1410',
            color: '#F2EDE4',
            border: `1px solid ${borderColor}`,
            borderRadius: 14,
            padding: leftIcon ? '0 16px 0 40px' : rightIcon ? '0 40px 0 16px' : '0 16px',
            fontSize: 16,
            outline: 'none',
            transition: 'border-color 0.2s',
            opacity: disabled ? 0.4 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
            ...ringStyle,
          }}
          placeholder={rest.placeholder}
          {...rest}
        />

        {rightIcon && (
          <span className="absolute right-3.5 pointer-events-none" style={{ color: '#7A8C78' }}>
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <span style={{ fontSize: 12, color: '#C97070' }}>{error}</span>
      )}
    </div>
  )
}
