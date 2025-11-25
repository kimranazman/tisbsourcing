import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CubeIcon,
  MapIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
  { name: 'Customers', href: '/customers', icon: UserGroupIcon },
  { name: 'Items', href: '/items', icon: CubeIcon },
  { name: 'Geographic', href: '/geographic', icon: MapIcon },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full w-64 glass-sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl glass-accent-purple flex items-center justify-center shadow-lg">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">Dropee</h1>
              <p className="text-xs text-slate-500">Analytics</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'glass-nav-item-active text-slate-800 shadow-lg'
                    : 'glass-nav-item text-slate-600 hover:text-slate-800'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
          <div className="px-4 py-3 rounded-2xl glass">
            <p className="text-xs font-medium text-slate-700">Data Source</p>
            <p className="text-xs text-slate-500 mt-1">Dropee Excel Export</p>
          </div>
        </div>
      </aside>
    </>
  )
}
