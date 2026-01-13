import React from 'react';

const NoticePreview = ({ formData }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const numberToWords = (amount) => {
    if (!amount) return 'zero dollars';
    const num = parseFloat(amount);
    // Simple implementation for common amounts
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    
    if (num < 10) return ones[Math.floor(num)] + ' dollars';
    if (num < 20) return teens[Math.floor(num) - 10] + ' dollars';
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '') + ' dollars';
    if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' ' + numberToWords(num % 100).replace(' dollars', '') : '') + ' dollars';
    
    return formatCurrency(amount); // Fallback for larger amounts
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 relative">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-red-500 text-6xl font-bold opacity-20 rotate-45 select-none">
          DRAFT - NOT LEGAL
        </div>
      </div>

      {/* Document Content */}
      <div className="relative z-0">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-sm text-gray-600 mb-2">
            {formData.landlordName && (
              <>
                {formData.landlordName}<br />
                {formData.landlordPhone && `Phone: ${formData.landlordPhone}`}<br />
                {formData.landlordEmail && `Email: ${formData.landlordEmail}`}
              </>
            )}
          </div>
        </div>

        <hr className="border-gray-400 mb-6" />

        {/* Title */}
        <h1 className="text-xl font-bold text-center mb-6 uppercase">
          NOTICE TO PAY RENT OR VACATE PREMISES
        </h1>
        <p className="text-center text-sm mb-6">(Utah Code § 78B-6-802)</p>

        {/* Recipient Info */}
        <div className="mb-6">
          <p><strong>TO:</strong> {formData.tenantNames || '[Tenant Name(s)]'}</p>
          <p><strong>PROPERTY ADDRESS:</strong> {
            [formData.street, formData.city, formData.state, formData.zipCode]
              .filter(Boolean)
              .join(', ') || '[Property Address]'
          }</p>
          <p><strong>DATE OF NOTICE:</strong> {formatDate(formData.noticeDate)}</p>
        </div>

        {/* Demand for Payment */}
        <div className="mb-6">
          <h2 className="font-bold mb-3">Demand for Payment</h2>
          <p className="mb-4">
            YOU ARE HEREBY NOTIFIED, pursuant to Utah Code Ann. § 78B-6-802, that you are in breach 
            of your rental agreement for the property located at the address listed above, due to the 
            failure to pay rent.
          </p>
          <p className="mb-2">The amount of rent past due is:</p>
          <p className="font-bold text-lg mb-2">
            TOTAL RENT DUE: {formatCurrency(formData.pastDueAmount)}
          </p>
          <p className="text-sm">
            ({numberToWords(formData.pastDueAmount)})
          </p>
          {formData.originalDueDate && (
            <p className="mt-2">
              (The original due date was {formatDate(formData.originalDueDate)}).
            </p>
          )}
        </div>

        {/* Pay or Vacate */}
        <div className="mb-6">
          <h2 className="font-bold mb-3">Pay or Vacate</h2>
          <p className="mb-4">You are hereby required to either:</p>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>
              <strong>PAY THE TOTAL RENT DUE</strong> in the amount of{' '}
              <strong>{formatCurrency(formData.pastDueAmount)}</strong> within{' '}
              <strong>three (3) calendar days</strong> of the date of service of this Notice, OR
            </li>
            <li>
              <strong>SURRENDER POSSESSION</strong> of the premises to the Landlord within the same{' '}
              <strong>three (3) calendar days</strong>.
            </li>
          </ol>
          <p>
            Failure to comply with this notice by either paying the full amount of rent or vacating 
            the premises within the three-day period will result in the Landlord filing an action for 
            Unlawful Detainer to regain possession of the premises and recover all costs, including 
            attorney's fees, as allowed by law.
          </p>
        </div>

        <hr className="border-gray-400 my-6" />

        {/* Signature Section */}
        <div className="mb-6">
          <h2 className="font-bold mb-3">Landlord Signature and Contact</h2>
          <p className="mb-4">This notice is issued by:</p>
          <p className="mb-4">{formData.landlordName || '[Landlord/Agent Name]'}</p>
          
          <div className="space-y-2">
            <p>Signature: _____________________________________</p>
            <p>Date: _____________________________________</p>
            <p>Phone: {formData.landlordPhone || '[Phone Number]'}</p>
            <p>Email: {formData.landlordEmail || '[Email Address]'}</p>
          </div>
        </div>

        <hr className="border-gray-400 my-6" />

        {/* Certificate of Service */}
        <div>
          <h2 className="font-bold mb-3">CERTIFICATE OF SERVICE</h2>
          <p className="text-sm mb-3">(To be completed by Landlord after printing)</p>
          
          <p className="mb-4">
            I certify that a true and correct copy of this Notice was served on the Tenant(s) 
            on the following date and by the following method:
          </p>
          
          <div className="space-y-2">
            <p>Date Served: _____________________________________</p>
            <p>Method of Service: ____________________________________________________________________</p>
            <p>Signature of Person Serving: _____________________________________</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticePreview;
