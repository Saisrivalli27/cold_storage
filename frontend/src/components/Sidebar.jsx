import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

const icons = {
  dashboard: '📊', inward: '📥', outward: '📤', stock: '📦', reports: '📈', settings: '⚙️'
}

export default function Sidebar() {
  const { t } = useTranslation()
  const { isAdmin } = useAuth()

  const navItems = [
    { to: '/', label: t('dashboard'), icon: icons.dashboard },
    { to: '/inward', label: t('inward'), icon: icons.inward },
    { to: '/outward', label: t('outward'), icon: icons.outward },
    { to: '/stock', label: t('stock'), icon: icons.stock },
    { to: '/reports', label: t('reports'), icon: icons.reports },
  ]
  if (isAdmin) {
    navItems.push({ to: '/settings', label: t('settings'), icon: icons.settings })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">❄</div>
        <div className="sidebar-brand">
          Cold Storage<span>Management System</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
