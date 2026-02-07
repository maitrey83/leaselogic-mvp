const PdfGenerator = require('../services/PdfGenerator');
const { generateNoticeHTML } = require('../templates/noticeTemplate');

let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('STRIPE_SECRET_KEY not set - payment endpoints will not work');
}



const createPaymentIntent = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Payment service not configured' });
  }
  try {
    const { amount = 999 } = req.body; // $9.99 in cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        product: 'utah-3day-notice'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

const verifyPaymentAndGeneratePDF = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Payment service not configured' });
  }
  try {
    const { paymentIntentId, formData } = req.body;

    // Verify payment was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Validate required fields
    if (!formData.street || !formData.tenantNames || !formData.pastDueAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate final PDF without watermark
    const htmlContent = generateNoticeHTML(formData, false); // false = no watermark
    const buffer = await PdfGenerator.generatePdf(htmlContent);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="utah-3day-notice-final.pdf"');
    res.send(buffer);

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment and generate PDF' });
  }
};

module.exports = {
  createPaymentIntent,
  verifyPaymentAndGeneratePDF
};
