import clsx from 'clsx'

export default function Card({ children, className, title, subtitle, action }) {
  return (
    <div className={clsx('glass-card overflow-hidden', className)}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-white/20 flex items-center justify-between">
          <div>
            {title && <h3 className="font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
