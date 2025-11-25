import clsx from 'clsx'

const gradients = {
  blue: 'from-blue-500 to-purple-600',
  pink: 'from-pink-500 to-rose-600',
  emerald: 'from-emerald-400 to-cyan-500',
  amber: 'from-amber-400 to-orange-500'
}

const glows = {
  blue: 'shadow-blue-500/30',
  pink: 'shadow-pink-500/30',
  emerald: 'shadow-emerald-500/30',
  amber: 'shadow-amber-500/30'
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl p-6 text-white shadow-xl transition-transform duration-300 hover:scale-[1.02]',
        `bg-gradient-to-br ${gradients[color]}`,
        `shadow-lg ${glows[color]}`
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-white/70 mt-1">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className="p-3 bg-white/20 rounded-xl">
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>

        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <span className={clsx(
              'text-sm font-medium px-2 py-0.5 rounded-full',
              trend.positive ? 'bg-white/20 text-white' : 'bg-red-500/30 text-red-100'
            )}>
              {trend.positive ? '+' : ''}{trend.value}
            </span>
            <span className="text-sm text-white/70">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  )
}
