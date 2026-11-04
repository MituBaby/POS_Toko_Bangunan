export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  as: Tag = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap'
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-900/20',
    dark: 'bg-ink-900 text-white hover:bg-ink-800',
    outline: 'border border-ink-300 bg-white text-ink-700 hover:border-ink-400 hover:bg-ink-50',
    ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200',
  }
  const sizes = {
    sm: 'text-[13px] px-3 h-8',
    md: 'text-sm px-4 h-10',
    lg: 'text-[15px] px-5 h-12',
    icon: 'h-9 w-9',
  }
  return (
    <Tag className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-ink-100 text-ink-600 border-ink-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    dark: 'bg-ink-900 text-white border-ink-900',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function Card({ children, className = '', as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={`rounded-xl border border-ink-200/80 bg-white shadow-[0_1px_2px_rgba(21,24,31,0.04)] ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[12.5px] font-semibold text-ink-700">{label}</span>
        {hint && <span className="text-[11px] text-ink-400">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

export const inputClass =
  'w-full rounded-lg border border-ink-300 bg-white px-3 h-10 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 focus:outline-none transition'

export function Input({ className = '', ...props }) {
  return <input className={`${inputClass} ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${inputClass} pr-8 cursor-pointer ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Modal({ open, onClose, title, subtitle, children, footer, width = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-ink-950/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`rise relative w-full ${width} max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-wide text-ink-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[12.5px] text-ink-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="-mr-1 -mt-1 rounded-md p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-800"
            aria-label="Tutup"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-ink-100 bg-ink-50/60 px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {Icon && (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-ink-400">
          <Icon size={20} strokeWidth={1.8} />
        </div>
      )}
      <p className="font-display text-lg font-semibold tracking-wide text-ink-800">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Stat({ label, value, sub, tone = 'light', icon: Icon }) {
  const dark = tone === 'dark'
  return (
    <div className={dark ? 'text-white' : 'text-ink-900'}>
      <div className={`flex items-center gap-1.5 text-[11.5px] font-semibold tracking-wide ${dark ? 'text-white/55' : 'text-ink-500'}`}>
        {Icon && <Icon size={13} strokeWidth={2} />}
        {label}
      </div>
      <div className={`mt-1.5 font-display text-[26px] leading-none font-semibold tabular ${dark ? 'text-white' : 'text-ink-900'}`}>
        {value}
      </div>
      {sub && <div className={`mt-1.5 text-[11.5px] ${dark ? 'text-white/45' : 'text-ink-400'}`}>{sub}</div>}
    </div>
  )
}
