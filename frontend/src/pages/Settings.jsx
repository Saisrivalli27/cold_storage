import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { settingsAPI, authAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function Settings() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState({ totalCapacity: 100000, ratePerKgPerDay: 2 })
  const [users, setUsers] = useState([])
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'staff' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsAPI.get().then(res => setSettings(res.data)).catch(console.error)
    authAPI.getUsers().then(res => setUsers(res.data)).catch(console.error)
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      await settingsAPI.update({ totalCapacity: settings.totalCapacity, ratePerKgPerDay: settings.ratePerKgPerDay })
      toast.success('Settings saved!')
    } catch (err) {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const addUser = async (e) => {
    e.preventDefault()
    try {
      await authAPI.register(newUser)
      toast.success('User created!')
      setNewUser({ name: '', email: '', password: '', role: 'staff' })
      authAPI.getUsers().then(res => setUsers(res.data))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user')
    }
  }

  return (
    <div>
      <h2 className="page-title">⚙️ {t('settings')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-title">{t('capacity')} & {t('billing')}</div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Total {t('capacity')} (kg)</label>
            <input className="form-input" type="number" value={settings.totalCapacity}
              onChange={e => setSettings({ ...settings, totalCapacity: Number(e.target.value) })} />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">{t('ratePerKgDay')}</label>
            <input className="form-input" type="number" step="0.01" value={settings.ratePerKgPerDay}
              onChange={e => setSettings({ ...settings, ratePerKgPerDay: Number(e.target.value) })} />
          </div>
          <button className="btn btn-primary" onClick={saveSettings} disabled={saving}>
            {saving ? 'Saving...' : t('save')}
          </button>
        </div>

        <div className="card">
          <div className="card-title">{t('addUser')}</div>
          <form onSubmit={addUser}>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">{t('name')}</label>
              <input className="form-input" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">{t('email')}</label>
              <input className="form-input" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">{t('password')}</label>
              <input className="form-input" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required minLength={6} />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">{t('role')}</label>
              <select className="form-select" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                <option value="staff">{t('staff')}</option>
                <option value="admin">{t('admin')}</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit">{t('addUser')}</button>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title">Users</div>
        <div className="table-container">
          <table>
            <thead><tr><th>{t('name')}</th><th>{t('email')}</th><th>{t('role')}</th><th>Created</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td><td>{u.email}</td>
                  <td><span className={`role-tag ${u.role}`}>{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
