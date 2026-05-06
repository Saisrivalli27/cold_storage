const PDFDocument = require('pdfkit');

/**
 * Generate an invoice PDF and pipe it to a writable stream (e.g., res).
 */
function generateInvoice(entry, settings, stream) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(stream);

  const daysStored = Math.max(
    1,
    Math.ceil((Date.now() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24))
  );
  const totalCost = entry.quantity * daysStored * settings.ratePerKgPerDay;

  // Header
  doc.fontSize(24).fillColor('#0f172a').text('Cold Storage Management', { align: 'center' });
  doc.fontSize(12).fillColor('#64748b').text('Tax Invoice', { align: 'center' });
  doc.moveDown(1.5);

  // Divider
  doc.strokeColor('#e2e8f0').lineWidth(1)
    .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  // Invoice details
  doc.fontSize(11).fillColor('#334155');
  doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'right' });
  doc.text(`Entry ID: ${entry._id}`, { align: 'right' });
  doc.moveDown(1);

  // Farmer details
  doc.fontSize(13).fillColor('#0f172a').text('Bill To:');
  doc.fontSize(11).fillColor('#475569');
  doc.text(`Name: ${entry.farmerName}`);
  doc.text(`Phone: ${entry.phone}`);
  doc.moveDown(1.5);

  // Table header
  const tableTop = doc.y;
  doc.fontSize(10).fillColor('#ffffff');
  doc.rect(50, tableTop, 495, 25).fill('#1e293b');
  doc.text('Product', 60, tableTop + 7);
  doc.text('Qty (kg)', 180, tableTop + 7);
  doc.text('Storage Type', 260, tableTop + 7);
  doc.text('Days', 360, tableTop + 7);
  doc.text('Rate (₹/kg/day)', 410, tableTop + 7);

  // Table row
  const rowTop = tableTop + 25;
  doc.fontSize(10).fillColor('#334155');
  doc.rect(50, rowTop, 495, 25).fill('#f8fafc').stroke('#e2e8f0');
  doc.fillColor('#334155');
  doc.text(entry.productType, 60, rowTop + 7);
  doc.text(entry.quantity.toString(), 180, rowTop + 7);
  doc.text(entry.storageType, 260, rowTop + 7);
  doc.text(daysStored.toString(), 360, rowTop + 7);
  doc.text(settings.ratePerKgPerDay.toFixed(2), 410, rowTop + 7);

  doc.moveDown(4);

  // Total
  doc.fontSize(14).fillColor('#0f172a');
  doc.text(`Total Amount: ₹${totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, {
    align: 'right'
  });

  doc.moveDown(2);
  doc.fontSize(9).fillColor('#94a3b8')
    .text('This is a computer-generated invoice. No signature required.', { align: 'center' });

  doc.end();
}

module.exports = { generateInvoice };
