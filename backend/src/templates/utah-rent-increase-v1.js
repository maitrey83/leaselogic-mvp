const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatCurrency = (amount) => {
  if (!amount) return '$0.00';
  return `$${parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const calculateIncrease = (current, newAmount) => {
  const increase = parseFloat(newAmount) - parseFloat(current);
  const percentage = ((increase / parseFloat(current)) * 100).toFixed(1);
  return { amount: formatCurrency(increase), percentage: `${percentage}%` };
};

const calculateDaysNotice = (noticeDate, effectiveDate) => {
  const notice = new Date(noticeDate);
  const effective = new Date(effectiveDate);
  const diffTime = Math.abs(effective - notice);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

module.exports = {
  id: 'utah-rent-increase-v1',
  version: '1.0',
  documentType: 'utah-rent-increase',
  
  render: (data) => {
    const increase = calculateIncrease(data.currentRent, data.newRent);
    const daysNotice = calculateDaysNotice(data.noticeDate, data.effectiveDate);
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Utah Rent Increase Notice</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 12px; line-height: 1.4; margin: 0; padding: 20px; color: #000; }
    .header { text-align: center; margin-bottom: 20px; }
    .title { font-size: 16px; font-weight: bold; text-align: center; margin: 20px 0; text-transform: uppercase; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; margin-bottom: 10px; }
    .signature-line { border-bottom: 1px solid #000; display: inline-block; width: 300px; margin-left: 10px; }
    hr { border: none; border-top: 2px solid #000; margin: 20px 0; }
    .amount { font-weight: bold; font-size: 14px; }
    .info-box { background-color: #f5f5f5; padding: 15px; border: 1px solid #ddd; margin: 15px 0; }
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
    NOTICE OF RENT INCREASE<br>
    <span style="font-size: 12px;">(Utah Code §57-22-4 and §57-22-5)</span>
  </div>
  <div class="section">
    <p><strong>TO:</strong> ${data.tenantNames || '[Tenant Name(s)]'}</p>
    <p><strong>PROPERTY ADDRESS:</strong> ${[data.street, data.city, data.state, data.zipCode].filter(Boolean).join(', ') || '[Property Address]'}</p>
    <p><strong>DATE OF NOTICE:</strong> ${formatDate(data.noticeDate)}</p>
  </div>
  <div class="section">
    <p>This notice is provided pursuant to Utah Code §57-22-4 and §57-22-5. Your rent will increase as follows:</p>
  </div>
  <div class="info-box">
    <p style="margin: 5px 0;"><strong>Current Monthly Rent:</strong> ${formatCurrency(data.currentRent)}</p>
    <p style="margin: 5px 0;"><strong>New Monthly Rent:</strong> ${formatCurrency(data.newRent)}</p>
    <p style="margin: 5px 0;"><strong>Increase Amount:</strong> ${increase.amount}</p>
    <p style="margin: 5px 0;"><strong>Percentage Increase:</strong> ${increase.percentage}</p>
    <p style="margin: 5px 0;"><strong>Effective Date:</strong> ${formatDate(data.effectiveDate)}</p>
  </div>
  <div class="section">
    <div class="section-title">Notice Period</div>
    <p>This notice is being provided <strong>${daysNotice} days</strong> in advance of the effective date, meeting the minimum 15-day notice requirement under Utah Code §57-22-4 for ${data.leaseType || 'month-to-month'} tenancies.</p>
  </div>
  ${data.reason ? `
  <div class="section">
    <div class="section-title">Reason for Increase</div>
    <p>${data.reason}</p>
  </div>` : ''}
  <div class="section">
    <div class="section-title">Your Rights</div>
    <p>You have the right to:</p>
    <ul>
      <li>Continue your tenancy at the new rent amount</li>
      <li>Terminate your tenancy by providing proper notice as required by your lease agreement</li>
      <li>Contact the landlord with questions or concerns about this rent increase</li>
    </ul>
  </div>
  ${data.paymentInstructions ? `
  <div class="section">
    <div class="section-title">Payment Instructions</div>
    <p>${data.paymentInstructions}</p>
  </div>` : ''}
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
      <strong>Generated by LeaseLogic v1.0 on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong><br>
      Automated document generator. Not legal advice. May contain errors. User responsible for accuracy. Consult an attorney before use.
    </p>
  </div>
</body>
</html>`;
  }
};
