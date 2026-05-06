import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { analyticsAPI } from '../services/api'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export default function Reports() {
  const { t } = useTranslation()
  const [data, setData] = useState(null)

  useEffect(() => {
    analyticsAPI.monthly().then(res => setData(res.data)).catch(console.error)
  }, [])

  const exportPDF = () => {
    if (!data) return
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Monthly Revenue Report', 14, 22)
    doc.setFontSize(11)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 30)
    const rows = data.monthlyData.map(m => [m.month, m.entries, `${m.totalQty} kg`, `₹${m.estimatedRevenue.toLocaleString()}`])
    doc.autoTable({ head: [['Month', 'Entries', 'Qty', 'Est. Revenue']], body: rows, startY: 36, styles: { fontSize: 10 } })
    doc.save('monthly_report.pdf')
  }

  const exportExcel = () => {
    if (!data) return
    const ws = XLSX.utils.json_to_sheet(data.monthlyData.map(m => ({
      Month: m.month, Entries: m.entries, 'Total Qty (kg)': m.totalQty, 'Est. Revenue (₹)': m.estimatedRevenue
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Report')
    XLSX.writeFile(wb, 'monthly_report.xlsx')
  }

  if (!data) return <div className="loading-screen"><div className="spinner"></div></div>

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">📈 {t('reports')}</h2>
        <div className="btn-group" style={{ margin: 0 }}>
          <button className="btn btn-secondary" onClick={exportPDF}>📄 {t('exportPdf')}</button>
          <button className="btn btn-secondary" onClick={exportExcel}>📊 {t('exportExcel')}</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-card cyan">
          <div className="kpi-label">{t('mostStored')}</div>
          <div className="kpi-value" style={{ fontSize: 22 }}>{data.topProduct?._id || 'N/A'}</div>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>{data.topProduct?.totalQty?.toLocaleString()} kg total</p>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">{t('active')} Entries</div>
          <div className="kpi-value">{data.activeEntries}</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">{t('completed')} Entries</div>
          <div className="kpi-value">{data.completedEntries}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">{t('monthlyRevenue')}</div>
        {data.monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="estimatedRevenue" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
              <Bar dataKey="totalQty" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Quantity (kg)" />
            </BarChart>
          </ResponsiveContainer>
        ) : <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>{t('noData')}</p>}
      </div>
    </div>
  )
}
