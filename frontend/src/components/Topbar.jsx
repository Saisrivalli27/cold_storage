import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Topbar() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'te' : 'en')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{t('welcome')}, {user?.name}</h1>
      </div>
      <div className="topbar-right">
        <button className="lang-toggle" onClick={toggleLang}>
          {i18n.language === 'en' ? 'తెలుగు' : 'English'}
        </button>
        <div className="user-badge">
          {user?.name}
          <span className={`role-tag ${user?.role}`}>{user?.role}</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>{t('logout')}</button>
      </div>
    </header>
  )
}
