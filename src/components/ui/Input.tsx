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

  const borderColor = error
    ? 'border-status-danger'
    : focused
    ? 'border-accent-purple'
    : 'border-border-default'

  const ringStyle = focused && !error
    ? { boxShadow: '0 0 0 3px rgba(103,76,191,0.2)' }
    : {}

  return (
    <div className={['flex flex-col gap-1.5', className].join(' ')}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3.5 text-text-secondary pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange?.(e.target.value)}
          style={ringStyle}
          className={[
            'w-full h-11 bg-bg-primary text-text-primary placeholder:text-text-secondary',
            'rounded-input border transition-all duration-200 outline-none text-base',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            leftIcon ? 'pl-10' : 'pl-4',
            rightIcon ? 'pr-10' : 'pr-4',
            borderColor,
          ].join(' ')}
          {...rest}
        />

        {rightIcon && (
          <span className="absolute right-3.5 text-text-secondary pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <span className="text-xs text-status-danger">{error}</span>
      )}
    </div>
  )
}
