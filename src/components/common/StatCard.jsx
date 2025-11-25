import clsx from 'clsx'

const accentColors = {
  blue: 'glass-accent-blue',
  pink: 'glass-accent-pink',
  emerald: 'glass-accent-emerald',
  amber: 'glass-accent-amber',
  purple: 'glass-accent-purple'
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  return (
    <div className="glass-stat p-6">
      {/* Accent color bar */}
      <div className={clsx(
        'absolute top-0 left-0 right-0 h-1 rounded-t-[28px]',
        accentColors[color]
      )} />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className={clsx(
              'p-3 rounded-2xl',
              accentColors[color]
            )}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
