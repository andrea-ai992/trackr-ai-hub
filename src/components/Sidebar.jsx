import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, Footprints, TrendingUp, Settings2, Newspaper,
  FolderOpen, Plane, Watch, Gem, ShoppingBag, Car, Music,
  Camera, Gamepad2, Package, Bitcoin, Bell, Languages,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Logo from './Logo'

const ICON_MAP = {
  LayoutDashboard, Footprints, TrendingUp, Watch, Gem,
  ShoppingBag, Car, Music, Camera, Gamepad2, Package, Bitcoin,
  Settings2, Newspaper, FolderOpen, Plane, Languages,
}

export function CategoryIcon({ name, size = 16, ...props }) {
  const Icon = ICON_MAP[name] || Package
  return <Icon size={size} {...props} />
}

function NavItem({ to, label, icon, color, end, badge }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
          isActive ? 'text-white' : 'text-gray-500 hover:text-gray-200'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <>
              <span className="absolute inset-0 rounded-xl opacity-10 blur-sm" style={{ background: color || '#6366f1' }} />
              <span className="absolute inset-0 rounded-xl border" style={{ borderColor: (color || '#6366f1') + '35', background: (color || '#6366f1') + '12' }} />
            </>
          )}
          <span className="relative flex items-center gap-2.5 w-full">
            <span className="w-6 h-6 flex items-center justify-center rounded-md transition-all"
              style={isActive ? { color: color || '#818cf8' } : {}}>
              <CategoryIcon name={icon} size={15} />
            </span>
            <span className="flex-1 truncate">{label}</span>
            {badge > 0 && (
              <span className="w-4 h-4 rounded-full bg-yellow-500 text-[9px] text-black font-bold flex items-center justify-center">{badge}</span>
            )}
            {isActive && <span className="w-1 h-1 rounded-full ml-auto" style={{ background: color || '#6366f1' }} />}
          </span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { categories, alerts } = useApp()
  const activeAlerts = alerts.filter(a => !a.triggered).length

  const catLinks = categories.map(c => ({
    to: c.id === 'sneakers' ? '/sneakers' : c.id === 'stocks' ? '/stocks' : c.id === 'flights' ? '/flights' : `/category/${c.id}`,
    label: c.name,
    icon: c.icon,
    color: c.color,
  }))

  return (
    <aside className="hidden md:flex flex-col w-52 min-h-screen bg-[#0d0d16] border-r border-white/[0.06] px-3 py-5 gap-1 shrink-0">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 px-3 mb-5 group">
        <Logo size={28} />
        <div>
          <div className="text-xs font-bold tracking-[0.18em] text-white/90 uppercase leading-none">Trackr</div>
          <div className="text-[9px] text-gray-700 tracking-wider uppercase mt-0.5">Portfolio Pro</div>
        </div>
      </Link>

      <NavItem to="/" label="Dashboard" icon="LayoutDashboard" color="#6366f1" end />
      <NavItem to="/news" label="Actualités" icon="Newspaper" color="#ec4899" badge={0} />
      <NavItem to="/portfolio" label="Portfolio" icon="FolderOpen" color="#8b5cf6" />
      <NavItem to="/translator" label="Traducteur" icon="Languages" color="#06b6d4" />

      <div className="my-2 border-t border-white/[0.05]" />
      <div className="px-3 mb-1">
        <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Catégories</span>
      </div>

      {catLinks.map(l => <NavItem key={l.to} {...l} />)}

      <div className="my-2 border-t border-white/[0.05]" />
      <NavItem to="/settings" label="Catégories" icon="Settings2" color="#64748b" />

      <div className="mt-auto px-3">
        <div className="text-[10px] text-gray-700 tracking-wider">v2.1 · Trackr</div>
      </div>
    </aside>
  )
}
