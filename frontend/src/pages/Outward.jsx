import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { inwardAPI, outwardAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function Outward() {
  const { t } = useTranslation()
  const [activeEntries, setActiveEntries] = useState([])
  const [selectedEntry, setSelectedEntry] = useState('')
  const [qty, setQty] = useState('')
  const [outwardList, setOutwardList] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    const [inRes, outRes] = await Promise.all([
      inwardAPI.getAll({ status: 'active' }),
      outwardAPI.getAll()
    ])
    setActiveEntries(inRes.data.filter(e => e.status === 'active'))
    setOutwardList(outRes.data)
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedEntry || !qty) return toast.error('Select an entry and enter quantity')
    setLoading(true)
    try {
      await outwardAPI.create({ inwardEntry: selectedEntry, quantityRemoved: parseFloat(qty) })
      toast.success('Stock removed successfully!')
      setSelectedEntry('')
      setQty('')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove stock')
    } finally {
      setLoading(false)
    }
  }

  const selected = activeEntries.find(e => e._id === selectedEntry)

  return (
    <div>
      <h2 className="page-title">📤 {t('outward')}</h2>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">{t('removeStock')}</div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Select Stock Entry</label>
              <select className="form-select" value={selectedEntry} onChange={e => setSelectedEntry(e.target.value)}>
                <option value="">-- Select --</option>
                {activeEntries.map(entry => (
                  <option key={entry._id} value={entry._id}>
                    {entry.farmerName} — {entry.productType} ({entry.remainingQty} kg avail.)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('qtyToRemove')}</label>
              <input className="form-input" type="number" step="0.1" min="0.1"
                max={selected?.remainingQty || 999999}
                value={qty} onChange={e => setQty(e.target.value)}
                placeholder={selected ? `Max: ${selected.remainingQty} kg` : 'Select entry first'} />
            </div>
          </div>
          {selected && (
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '8px 0' }}>
              Available: <strong style={{ color: '#10b981' }}>{selected.remainingQty} kg</strong> of {selected.productType}
            </p>
          )}
          <div className="btn-group">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Processing...' : t('submit')}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-title">Outward History</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('farmerName')}</th>
                <th>{t('productType')}</th>
                <th>Removed</th>
                <th>{t('date')}</th>
                <th>Processed By</th>
              </tr>
            </thead>
            <tbody>
              {outwardList.map(o => (
                <tr key={o._id}>
                  <td>{o.inwardEntry?.farmerName || 'N/A'}</td>
                  <td>{o.inwardEntry?.productType || 'N/A'}</td>
                  <td>{o.quantityRemoved} kg</td>
                  <td>{new Date(o.date).toLocaleDateString('en-IN')}</td>
                  <td>{o.createdBy?.name || 'N/A'}</td>
                </tr>
              ))}
              {outwardList.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>{t('noData')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
