const puppeteer = require('puppeteer');

class PdfGenerator {
  static async generatePdf(htmlContent, options = {}) {
    const defaultOptions = {
      format: 'A4',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true
    };

    const pdfOptions = { ...defaultOptions, ...options };
    let browser = null;

    try {
      const execPath = puppeteer.executablePath();
      console.log(`Puppeteer executablePath: ${execPath}`);

      const launchOptions = {
        headless: 'new',
        executablePath: execPath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process'
        ]
      };

      browser = await puppeteer.launch(launchOptions);

      const page = await browser.newPage();
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      const pdfBuffer = await page.pdf(pdfOptions);
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF: ' + error.message);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

module.exports = PdfGenerator;
