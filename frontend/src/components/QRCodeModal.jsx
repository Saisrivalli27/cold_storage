import { QRCodeSVG } from 'qrcode.react'

export default function QRCodeModal({ entryId, onClose }) {
  if (!entryId) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">QR Code</h3>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
          <QRCodeSVG
            value={`COLD-STORAGE-ENTRY:${entryId}`}
            size={200}
            bgColor="transparent"
            fgColor="#e2e8f0"
            level="M"
          />
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
          Entry ID: {entryId}
        </p>
        <div className="btn-group" style={{ justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
