import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { analyticsAPI, stockAPI } from '../services/api'

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']

export default function Dashboard() {
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [unit, setUnit] = useState('kg') // kg, quintal, ton

  useEffect(() => {
    Promise.all([analyticsAPI.dashboard(), stockAPI.getAlerts()])
      .then(([dashRes, alertRes]) => {
        setData(dashRes.data)
        setAlerts(alertRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const getUnitMultiplier = () => {
    if (unit === 'quintal') return 100;
    if (unit === 'ton') return 1000;
    return 1;
  };

  const unitLabel = unit === 'quintal' ? 'qtl' : (unit === 'ton' ? 't' : 'kg');

  const formatWeight = (valueInKg) => {
    const val = valueInKg / getUnitMultiplier();
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' ' + unitLabel;
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>
  if (!data) return <p>Failed to load dashboard data.</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 15 }}>
        <select 
          value={unit} 
          onChange={(e) => setUnit(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', outline: 'none', cursor: 'pointer' }}
        >
          <option value="kg">{t('unit_kg', 'Kilogram (kg)')}</option>
          <option value="quintal">{t('unit_quintal', 'Quintal (qtl)')}</option>
          <option value="ton">{t('unit_ton', 'Ton (t)')}</option>
        </select>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {alerts.slice(0, 5).map((a, i) => (
            <div key={i} className={`alert-banner ${a.severity}`}>
              {a.severity === 'high' ? '🔴' : '🟡'} {a.message}
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card cyan">
          <div className="kpi-label">{t('totalStock')}</div>
          <div className="kpi-value">{formatWeight(data.totalStock)}</div>
          <div className="kpi-icon">📦</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">{t('availableCapacity')}</div>
          <div className="kpi-value">{formatWeight(data.availableCapacity)}</div>
          <div className="kpi-icon">📊</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-label">{t('todayInward')}</div>
          <div className="kpi-value">{formatWeight(data.todayInward)}</div>
          <div className="kpi-icon">📥</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">{t('todayOutward')}</div>
          <div className="kpi-value">{formatWeight(data.todayOutward)}</div>
          <div className="kpi-icon">📤</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-label">{t('totalRevenue')}</div>
          <div className="kpi-value">₹{data.totalRevenue.toLocaleString()}</div>
          <div className="kpi-icon">💰</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-title">{t('productWiseStock')}</div>
          {data.productStock.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={data.productStock} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.productStock.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>{t('noData')}</p>}
        </div>
        <div className="card">
          <div className="card-title">{t('dailyInOut')}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Legend />
              <Bar dataKey="inward" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outward" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Temperature Monitor Placeholder */}
      <div className="temp-card">
        <h3>🌡️ {t('temperatureMonitor')}</h3>
        <p>{t('iotPlaceholder')}</p>
      </div>
    </div>
  )
}
