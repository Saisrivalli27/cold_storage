import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { inwardAPI } from '../services/api'
import QRCodeModal from '../components/QRCodeModal'
import toast from 'react-hot-toast'

export default function Inward() {
  const { t } = useTranslation()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [qrEntry, setQrEntry] = useState(null)

  const [unit, setUnit] = useState('kg')

  const fetchEntries = () => {
    inwardAPI.getAll().then(res => setEntries(res.data)).catch(console.error)
  }

  useEffect(() => { fetchEntries() }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const formData = new FormData()

      let finalQty = parseFloat(data.quantity);
      if (unit === 'quintal') finalQty *= 100;
      if (unit === 'ton') finalQty *= 1000;

      Object.keys(data).forEach(key => {
        if (key === 'quantity') {
          formData.append('quantity', finalQty);
        } else if (key === 'image' && data[key]?.[0]) {
          formData.append('image', data[key][0])
        } else {
          formData.append(key, data[key])
        }
      })
      await inwardAPI.create(formData)
      toast.success('Inward entry created!')
      reset()
      fetchEntries()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create entry')
    } finally {
      setLoading(false)
    }
  }

  const onError = (errors) => {
    if (errors.phone) {
      toast.error('Phone number is wrong (must be exactly 10 digits)');
    }
  }

  return (
    <div>
      <h2 className="page-title">📥 {t('inward')}</h2>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">New Inward Entry</div>
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">{t('farmerName')}</label>
              <input className="form-input" {...register('farmerName', { required: true })} placeholder="Enter farmer name" />
              {errors.farmerName && <span className="form-error">Required</span>}
            </div>
            <div className="form-group">
              <label className="form-label">{t('phone')}</label>
              <input 
                className="form-input" 
                type="tel"
                maxLength="10"
                {...register('phone', { 
                  required: true, 
                  pattern: /^[0-9]{10}$/,
                  minLength: 10,
                  maxLength: 10
                })} 
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                }}
                placeholder="9876543210" 
              />
              {errors.phone && <span className="form-error">Must be exactly 10 digits</span>}
            </div>
            <div className="form-group">
              <label className="form-label">{t('productType')}</label>
              <input className="form-input" {...register('productType', { required: true })} placeholder="e.g. Potatoes, Apples" />
              {errors.productType && <span className="form-error">Required</span>}
            </div>
            <div className="form-group">
              <label className="form-label">{t('quantity')}</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input style={{ flex: 1 }} className="form-input" type="number" step="0.1" {...register('quantity', { required: true, min: 0.1 })} placeholder={`Quantity in ${unit}`} />
                <select 
                  className="form-select" 
                  style={{ width: '100px' }} 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="kg">kg</option>
                  <option value="quintal">qtl</option>
                  <option value="ton">ton</option>
                </select>
              </div>
              {errors.quantity && <span className="form-error">Min 0.1</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Price per Unit (₹)</label>
              <input className="form-input" type="number" step="0.1" {...register('pricePerUnit', { required: true, min: 0 })} defaultValue={2} placeholder="e.g. 2" />
              {errors.pricePerUnit && <span className="form-error">Min 0</span>}
            </div>
            <div className="form-group">
              <label className="form-label">{t('storageType')}</label>
              <select className="form-select" {...register('storageType', { required: true })}>
                <option value="Cold">{t('cold')}</option>
                <option value="Frozen">{t('frozen')}</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('expectedDuration')}</label>
              <input className="form-input" type="number" {...register('expectedDuration', { required: true, min: 1 })} placeholder="Days" />
              {errors.expectedDuration && <span className="form-error">Min 1 day</span>}
            </div>
            <div className="form-group">
              <label className="form-label">{t('date')}</label>
              <input className="form-input" type="date" {...register('date')} defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('image')}</label>
              <input className="form-input" type="file" accept="image/*" {...register('image')} />
            </div>
          </div>
          <div className="btn-group">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : t('submit')}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => reset()}>{t('cancel')}</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-title">Inward Entries</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('farmerName')}</th>
                <th>{t('productType')}</th>
                <th>{t('quantity')}</th>
                <th>Price/Unit</th>
                <th>Remaining</th>
                <th>{t('storageType')}</th>
                <th>{t('date')}</th>
                <th>Status</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e._id}>
                  <td>{e.farmerName}</td>
                  <td>{e.productType}</td>
                  <td>{e.quantity} kg</td>
                  <td>₹{e.pricePerUnit !== undefined ? e.pricePerUnit : 2}</td>
                  <td>{e.remainingQty} kg</td>
                  <td>{e.storageType}</td>
                  <td>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                  <td><span className={`status-badge ${e.status}`}>{e.status}</span></td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => setQrEntry(e._id)}>{t('viewQR')}</button>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && <tr><td colSpan="9" style={{ textAlign: 'center', color: '#64748b' }}>{t('noData')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {qrEntry && <QRCodeModal entryId={qrEntry} onClose={() => setQrEntry(null)} />}
    </div>
  )
}
