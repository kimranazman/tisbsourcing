import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useFilterStore } from '../../store/filterStore'

export default function Header({ onMenuClick, title }) {
  const { search, setSearch } = useFilterStore()

  return (
    <header className="h-16 glass-header flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl glass-button lg:hidden"
        >
          <Bars3Icon className="w-6 h-6 text-slate-600" />
        </button>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>

      {/* Search bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, items, customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 glass rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
          <span className="text-xs font-medium text-slate-600">Live Data</span>
        </div>
      </div>
    </header>
  )
}
