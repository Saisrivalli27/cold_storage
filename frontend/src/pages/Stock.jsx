import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { stockAPI, billingAPI } from '../services/api'
import QRCodeModal from '../components/QRCodeModal'
import toast from 'react-hot-toast'

export default function Stock() {
  const { t } = useTranslation()
  const [stock, setStock] = useState([])
  const [filter, setFilter] = useState({ product: '', storageType: '', status: 'active' })
  const [qrEntry, setQrEntry] = useState(null)

  const fetchStock = () => {
    stockAPI.getAll(filter).then(res => setStock(res.data)).catch(console.error)
  }

  useEffect(() => { fetchStock() }, [filter])

  const downloadInvoice = async (id) => {
    try {
      const res = await billingAPI.invoice(id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice_${id}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success('Invoice downloaded!')
    } catch (err) {
      toast.error('Failed to generate invoice')
    }
  }

  return (
    <div>
      <h2 className="page-title">📦 {t('stock')}</h2>
      <div className="filter-bar">
        <input className="form-input" placeholder={`${t('filter')} by product...`}
          value={filter.product} onChange={e => setFilter({ ...filter, product: e.target.value })} />
        <select className="form-select" value={filter.storageType}
          onChange={e => setFilter({ ...filter, storageType: e.target.value })}>
          <option value="">{t('all')} Types</option>
          <option value="Cold">{t('cold')}</option>
          <option value="Frozen">{t('frozen')}</option>
        </select>
        <select className="form-select" value={filter.status}
          onChange={e => setFilter({ ...filter, status: e.target.value })}>
          <option value="active">{t('active')}</option>
          <option value="completed">{t('completed')}</option>
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('productType')}</th>
                <th>{t('farmerName')}</th>
                <th>{t('quantity')}</th>
                <th>Remaining</th>
                <th>{t('storageType')}</th>
                <th>{t('date')}</th>
                <th>{t('remainingDays')}</th>
                <th>Status</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {stock.map(s => (
                <tr key={s._id}>
                  <td>{s.productType}</td>
                  <td>{s.farmerName}</td>
                  <td>{s.quantity} kg</td>
                  <td>{s.remainingQty} kg</td>
                  <td>{s.storageType}</td>
                  <td>{new Date(s.date).toLocaleDateString('en-IN')}</td>
                  <td>
                    <span className={`status-badge ${s.isExpired ? 'expired' : s.isNearExpiry ? 'warning' : 'active'}`}>
                      {s.isExpired ? 'Expired' : `${s.remainingDays} days`}
                    </span>
                  </td>
                  <td><span className={`status-badge ${s.status}`}>{s.status}</span></td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => setQrEntry(s._id)}>QR</button>
                    <button className="btn btn-sm btn-success" onClick={() => downloadInvoice(s._id)}>📄</button>
                  </td>
                </tr>
              ))}
              {stock.length === 0 && <tr><td colSpan="9" style={{ textAlign: 'center', color: '#64748b' }}>{t('noData')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {qrEntry && <QRCodeModal entryId={qrEntry} onClose={() => setQrEntry(null)} />}
    </div>
  )
}
