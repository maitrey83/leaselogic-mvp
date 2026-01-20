/**
 * Utah Rent Increase Notice - Final Template
 * Task 3.3: Rent Increase Templates
 *
 * Legal References:
 * - Utah Code §57-22-4 (Notice Requirements)
 * - Utah Code §57-22-5 (Rent Increases)
 * - Utah Code §57-22-6 (Retaliatory Conduct)
 */

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
  const currentVal = parseFloat(current) || 0;
  const newVal = parseFloat(newAmount) || 0;
  const increase = newVal - currentVal;
  const percentage = currentVal > 0 ? ((increase / currentVal) * 100).toFixed(1) : '0.0';
  return { amount: formatCurrency(increase), percentage: `${percentage}%` };
};

const calculateDaysNotice = (noticeDate, effectiveDate) => {
  if (!noticeDate || !effectiveDate) return 0;
  const notice = new Date(noticeDate);
  const effective = new Date(effectiveDate);
  const diffTime = Math.abs(effective - notice);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const formatAddress = (data) => {
  const parts = [];
  if (data.street) parts.push(data.street);
  if (data.unitNumber) parts.push(`Unit ${data.unitNumber}`);
  if (data.city) parts.push(data.city);
  if (data.state) parts.push(data.state);
  if (data.zipCode) parts.push(data.zipCode);
  return parts.length > 0 ? parts.join(', ') : '[Property Address]';
};

const getLeaseTypeLabel = (leaseType) => {
  const types = {
    'month-to-month': 'month-to-month',
    'week-to-week': 'week-to-week'
  };
  return types[leaseType] || 'month-to-month';
};

const getMinimumNoticeDays = (leaseType) => {
  return leaseType === 'week-to-week' ? 5 : 15;
};

module.exports = {
  id: 'utah-rent-increase-v1',
  version: '1.0',
  documentType: 'utah-rent-increase',

  render: (data) => {
    const increase = calculateIncrease(data.currentRent, data.newRent);
    const daysNotice = calculateDaysNotice(data.noticeDate, data.effectiveDate);
    const leaseTypeLabel = getLeaseTypeLabel(data.leaseType);
    const minNoticeDays = getMinimumNoticeDays(data.leaseType);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Utah Rent Increase Notice</title>
  <style>
    @page {
      size: letter;
      margin: 1in;
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12px;
      line-height: 1.4;
      margin: 0;
      padding: 20px;
      color: #000;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .landlord-info {
      font-size: 11px;
      margin-bottom: 10px;
      line-height: 1.4;
    }
    .title {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
      text-transform: uppercase;
    }
    .title-subtitle {
      font-size: 11px;
      font-weight: normal;
      margin-top: 5px;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-weight: bold;
      font-size: 13px;
      margin-bottom: 10px;
      border-bottom: 1px solid #ccc;
      padding-bottom: 5px;
    }
    .signature-line {
      border-bottom: 1px solid #000;
      display: inline-block;
      width: 250px;
      margin-left: 10px;
    }
    hr {
      border: none;
      border-top: 2px solid #000;
      margin: 20px 0;
    }
    .info-box {
      background-color: #f5f5f5;
      padding: 15px;
      border: 1px solid #ddd;
      margin: 15px 0;
      border-radius: 4px;
    }
    .info-row {
      margin: 8px 0;
      display: flex;
      justify-content: space-between;
    }
    .info-label {
      font-weight: bold;
    }
    .info-value {
      text-align: right;
    }
    ul {
      padding-left: 20px;
      margin: 10px 0;
    }
    li {
      margin-bottom: 8px;
    }
    .legal-text {
      font-size: 11px;
      line-height: 1.5;
      color: #333;
    }
    .legal-notice {
      background-color: #f9f9f9;
      padding: 15px;
      border: 1px solid #ddd;
      font-size: 10px;
      margin-top: 30px;
    }
    .legal-notice-title {
      font-weight: bold;
      color: #d32f2f;
      margin-bottom: 8px;
    }
    .footer-info {
      font-size: 8pt;
      color: #666;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #ccc;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="landlord-info">
      ${data.landlordName || '[Landlord/Agent Name]'}<br>
      ${data.landlordPhone ? `Phone: ${data.landlordPhone}` : ''}${data.landlordPhone && data.landlordEmail ? '<br>' : ''}
      ${data.landlordEmail ? `Email: ${data.landlordEmail}` : ''}
    </div>
  </div>

  <hr>

  <div class="title">
    NOTICE OF RENT INCREASE
    <div class="title-subtitle">(Pursuant to Utah Code §57-22-4 and §57-22-5)</div>
  </div>

  <div class="section">
    <p><strong>TO:</strong> ${data.tenantNames || '[Tenant Name(s)]'}</p>
    <p><strong>PROPERTY ADDRESS:</strong> ${formatAddress(data)}</p>
    <p><strong>DATE OF NOTICE:</strong> ${formatDate(data.noticeDate)}</p>
  </div>

  <div class="section">
    <p>This notice is provided pursuant to Utah Code §57-22-4 (Notice Requirements) and §57-22-5 (Rent Increases). Please be advised that your monthly rent will increase as detailed below:</p>
  </div>

  <div class="info-box">
    <div class="info-row">
      <span class="info-label">Current Monthly Rent:</span>
      <span class="info-value">${formatCurrency(data.currentRent)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">New Monthly Rent:</span>
      <span class="info-value">${formatCurrency(data.newRent)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Increase Amount:</span>
      <span class="info-value">${increase.amount}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Percentage Increase:</span>
      <span class="info-value">${increase.percentage}</span>
    </div>
    <hr style="margin: 10px 0; border-top: 1px dashed #ccc;">
    <div class="info-row">
      <span class="info-label">Effective Date:</span>
      <span class="info-value"><strong>${formatDate(data.effectiveDate)}</strong></span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Notice Period Compliance</div>
    <p>This notice is being provided <strong>${daysNotice} days</strong> in advance of the effective date. Under Utah Code §57-22-4, a minimum of <strong>${minNoticeDays} days</strong> written notice is required for ${leaseTypeLabel} tenancies before a rent increase can take effect.</p>
  </div>

  ${data.reasonForIncrease ? `
  <div class="section">
    <div class="section-title">Reason for Increase</div>
    <p>${data.reasonForIncrease}</p>
  </div>` : ''}

  <div class="section">
    <div class="section-title">Your Rights Under Utah Law</div>
    <p class="legal-text">Pursuant to Utah Code §57-22-5 and §57-22-6, you have the following rights:</p>
    <ul>
      <li><strong>Continue Tenancy:</strong> You may continue your tenancy at the new rent amount by paying the increased rent on or after the effective date.</li>
      <li><strong>Terminate Tenancy:</strong> You may choose to terminate your tenancy by providing proper written notice as required by your lease agreement or Utah law.</li>
      <li><strong>Non-Retaliation Protection:</strong> Under Utah Code §57-22-6, this rent increase is not being issued in retaliation for any lawful actions you have taken, including but not limited to filing complaints, requesting repairs, or exercising your legal rights.</li>
      <li><strong>Contact Landlord:</strong> You may contact the landlord with questions or concerns regarding this rent increase.</li>
    </ul>
  </div>

  ${data.paymentInstructions ? `
  <div class="section">
    <div class="section-title">Payment Instructions</div>
    <p>${data.paymentInstructions}</p>
  </div>` : ''}

  <hr>

  <div class="section">
    <div class="section-title">Landlord/Agent Certification</div>
    <p>I certify that this notice complies with Utah Code §57-22-4 notice requirements and that this rent increase is not retaliatory in nature as prohibited by Utah Code §57-22-6.</p>
    <p style="margin-top: 20px;">
      <strong>Landlord/Agent:</strong> ${data.landlordName || '[Landlord/Agent Name]'}
    </p>
    <p>Signature: <span class="signature-line"></span></p>
    <p>Date: <span class="signature-line"></span></p>
    <p style="margin-top: 15px;">
      <strong>Contact Information:</strong><br>
      Phone: ${data.landlordPhone || '[Phone Number]'}<br>
      ${data.landlordEmail ? `Email: ${data.landlordEmail}` : ''}
    </p>
  </div>

  <hr>

  <div class="section">
    <div class="section-title">CERTIFICATE OF SERVICE</div>
    <p style="font-size: 11px; margin-bottom: 10px;">(To be completed by Landlord after printing)</p>
    <p>I certify that a true and correct copy of this Notice was served on the Tenant(s) on the following date and by the following method:</p>
    <p>Date Served: <span class="signature-line"></span></p>
    <p>Method of Service: <span class="signature-line" style="width: 400px;"></span></p>
    <p style="font-size: 10px; color: #666; margin-top: 5px;">(e.g., Personal delivery, Posted on door, Certified mail)</p>
    <p>Signature of Person Serving: <span class="signature-line"></span></p>
  </div>

  <hr style="margin: 30px 0;">

  <div class="legal-notice">
    <p class="legal-notice-title">IMPORTANT LEGAL NOTICE</p>
    <p style="margin-bottom: 5px;"><strong>This document was generated by LeaseLogic, a document template service.</strong></p>
    <p style="margin-bottom: 5px;">• This service does NOT provide legal advice or legal representation</p>
    <p style="margin-bottom: 5px;">• You are responsible for ensuring compliance with current Utah laws</p>
    <p style="margin-bottom: 5px;">• Laws may change; verify all legal requirements are current</p>
    <p style="margin-bottom: 5px;">• Consult with a qualified Utah attorney for legal advice</p>
    <p style="margin-bottom: 0;">• Use of this document is at your own risk</p>
    <div class="footer-info">
      <strong>Generated by LeaseLogic v1.0 on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong><br>
      Document ID: utah-rent-increase-v1 | LeaseLogic.com
    </div>
  </div>
</body>
</html>`;
  }
};
