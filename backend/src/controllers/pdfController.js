const PdfGenerator = require('../services/PdfGenerator');
const TemplateEngine = require('../services/TemplateEngine');



const generatePDF = async (req, res) => {
  try {
    const { documentType = 'utah-3day-pay-or-quit', ...formData } = req.body;
    
    // Validate required fields (basic validation)
    if (!formData.street || !formData.tenantNames) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Determine template ID based on document type
    const templateId = documentType === 'utah-rent-increase' 
      ? 'utah-rent-increase-v1' 
      : 'utah-3day-notice-v1';

    // Generate HTML content using TemplateEngine
    const htmlContent = TemplateEngine.render(templateId, formData);

    // Generate PDF
    const buffer = await PdfGenerator.generatePdf(htmlContent);

    // Set headers for PDF download
    const filename = documentType === 'utah-rent-increase' 
      ? 'utah-rent-increase-notice.pdf' 
      : 'utah-3day-notice.pdf';
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

const generatePreviewPDF = async (req, res) => {
  try {
    const { documentType = 'utah-3day-pay-or-quit', ...formData } = req.body;
    
    // Determine preview template ID based on document type
    const templateId = documentType === 'utah-rent-increase' 
      ? 'utah-rent-increase-preview-v1' 
      : 'utah-3day-notice-preview-v1';

    // Generate HTML content with watermark using TemplateEngine
    const htmlContent = TemplateEngine.render(templateId, formData);

    // Generate PDF
    const buffer = await PdfGenerator.generatePdf(htmlContent);

    // Set headers for PDF preview
    const filename = documentType === 'utah-rent-increase' 
      ? 'utah-rent-increase-notice-preview.pdf' 
      : 'utah-3day-notice-preview.pdf';
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(buffer);

  } catch (error) {
    console.error('PDF preview generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF preview' });
  }
};

module.exports = {
  generatePDF,
  generatePreviewPDF
};
