const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatCurrency = (amount) => {
  if (!amount) return '$0.00';
  return `$${parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const numberToWords = (amount) => {
  if (!amount) return 'zero dollars';
  const num = parseFloat(amount);
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  
  if (num < 10) return ones[Math.floor(num)] + ' dollars';
  if (num < 20) return teens[Math.floor(num) - 10] + ' dollars';
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '') + ' dollars';
  if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' ' + numberToWords(num % 100).replace(' dollars', '') : '') + ' dollars';
  return formatCurrency(amount);
};

module.exports = {
  id: 'utah-3day-notice-v1',
  version: '1.0',
  documentType: 'utah-3day-pay-or-quit',
  
  render: (data) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Utah 3-Day Notice to Pay or Vacate</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 12px; line-height: 1.4; margin: 0; padding: 20px; color: #000; }
    .header { text-align: center; margin-bottom: 20px; }
    .title { font-size: 16px; font-weight: bold; text-align: center; margin: 20px 0; text-transform: uppercase; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; margin-bottom: 10px; }
    .signature-line { border-bottom: 1px solid #000; display: inline-block; width: 300px; margin-left: 10px; }
    hr { border: none; border-top: 2px solid #000; margin: 20px 0; }
    ol { padding-left: 20px; }
    .amount { font-weight: bold; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 11px; margin-bottom: 10px;">
      ${data.landlordName || '[Landlord/Agent Name]'}<br>
      ${data.landlordPhone ? `Phone: ${data.landlordPhone}` : ''}<br>
      ${data.landlordEmail ? `Email: ${data.landlordEmail}` : ''}
    </div>
  </div>
  <hr>
  <div class="title">
    NOTICE TO PAY RENT OR VACATE PREMISES<br>
    <span style="font-size: 12px;">(Utah Code § 78B-6-802)</span>
  </div>
  <div class="section">
    <p><strong>TO:</strong> ${data.tenantNames || '[Tenant Name(s)]'}</p>
    <p><strong>PROPERTY ADDRESS:</strong> ${[data.street, data.city, data.state, data.zipCode].filter(Boolean).join(', ') || '[Property Address]'}</p>
    <p><strong>DATE OF NOTICE:</strong> ${formatDate(data.noticeDate)}</p>
  </div>
  <div class="section">
    <div class="section-title">Demand for Payment</div>
    <p>YOU ARE HEREBY NOTIFIED, pursuant to Utah Code Ann. § 78B-6-802, that you are in breach of your rental agreement for the property located at the address listed above, due to the failure to pay rent.</p>
    <p>The amount of rent past due is:</p>
    <p class="amount">TOTAL RENT DUE: ${formatCurrency(data.pastDueAmount)}</p>
    <p style="font-size: 11px;">(${numberToWords(data.pastDueAmount)})</p>
    ${data.originalDueDate ? `<p>(The original due date was ${formatDate(data.originalDueDate)}.)</p>` : ''}
  </div>
  <div class="section">
    <div class="section-title">Pay or Vacate</div>
    <p>You are hereby required to either:</p>
    <ol>
      <li><strong>PAY THE TOTAL RENT DUE</strong> in the amount of <strong>${formatCurrency(data.pastDueAmount)}</strong> within <strong>three (3) calendar days</strong> of the date of service of this Notice, OR</li>
      <li><strong>SURRENDER POSSESSION</strong> of the premises to the Landlord within the same <strong>three (3) calendar days</strong>.</li>
    </ol>
    <p>Failure to comply with this notice by either paying the full amount of rent or vacating the premises within the three-day period will result in the Landlord filing an action for Unlawful Detainer to regain possession of the premises and recover all costs, including attorney's fees, as allowed by law.</p>
  </div>
  <hr>
  <div class="section">
    <div class="section-title">Landlord Signature and Contact</div>
    <p>This notice is issued by:</p>
    <p>${data.landlordName || '[Landlord/Agent Name]'}</p>
    <p>Signature: <span class="signature-line"></span></p>
    <p>Date: <span class="signature-line"></span></p>
    <p>Phone: ${data.landlordPhone || '[Phone Number]'}</p>
    <p>Email: ${data.landlordEmail || '[Email Address]'}</p>
  </div>
  <hr>
  <div class="section">
    <div class="section-title">CERTIFICATE OF SERVICE</div>
    <p style="font-size: 11px; margin-bottom: 10px;">(To be completed by Landlord after printing)</p>
    <p>I certify that a true and correct copy of this Notice was served on the Tenant(s) on the following date and by the following method:</p>
    <p>Date Served: <span class="signature-line"></span></p>
    <p>Method of Service: <span class="signature-line" style="width: 400px;"></span></p>
    <p>Signature of Person Serving: <span class="signature-line"></span></p>
  </div>
  <hr style="margin: 30px 0;">
  <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; font-size: 10px;">
    <p style="font-weight: bold; color: #d32f2f; margin-bottom: 8px;">IMPORTANT LEGAL NOTICE</p>
    <p style="margin-bottom: 5px;"><strong>This document was generated by LeaseLogic, a document template service.</strong></p>
    <p style="margin-bottom: 5px;">• This service does NOT provide legal advice or legal representation</p>
    <p style="margin-bottom: 5px;">• You are responsible for ensuring compliance with current Utah laws</p>
    <p style="margin-bottom: 5px;">• Consult with a qualified Utah attorney for legal advice</p>
    <p style="margin-bottom: 5px;">• Use of this document is at your own risk</p>
    <p style="margin-bottom: 0;">Generated on: ${new Date().toLocaleDateString()} | LeaseLogic.com</p>
    <p style="font-size: 8pt; color: #666; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ccc;">
      <strong>Generated by LeaseLogic v1.3 on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong><br>
      Automated document generator. Not legal advice. May contain errors. User responsible for accuracy. Consult an attorney before use.
    </p>
  </div>
</body>
</html>`;
  }
};
