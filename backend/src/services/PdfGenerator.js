const puppeteer = require('puppeteer');

// Singleton browser instance — Chrome uses ~200MB, so we launch once
// and reuse across requests instead of spawning per-request.
let browserInstance = null;
let browserLaunchPromise = null;

// Concurrency queue — only one PDF at a time to stay under 512MB (Render free tier)
let pdfQueue = Promise.resolve();

class PdfGenerator {
  static async getBrowser() {
    if (browserInstance && browserInstance.connected) {
      return browserInstance;
    }

    // Prevent multiple simultaneous launches
    if (browserLaunchPromise) {
      return browserLaunchPromise;
    }

    browserLaunchPromise = puppeteer.launch({
      headless: 'new',
      executablePath: puppeteer.executablePath(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--disable-extensions',
        '--js-flags=--max-old-space-size=128',
      ]
    });

    browserInstance = await browserLaunchPromise;
    browserLaunchPromise = null;

    // Auto-recover if Chrome crashes
    browserInstance.on('disconnected', () => {
      browserInstance = null;
    });

    return browserInstance;
  }

  static async generatePdf(htmlContent, options = {}) {
    const defaultOptions = {
      format: 'A4',
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
      printBackground: true
    };

    const pdfOptions = { ...defaultOptions, ...options };

    // Queue requests so only one PDF generates at a time
    const result = new Promise((resolve, reject) => {
      pdfQueue = pdfQueue.then(async () => {
        let page = null;
        try {
          const browser = await PdfGenerator.getBrowser();
          page = await browser.newPage();
          await page.setContent(htmlContent, {
            waitUntil: 'networkidle0',
            timeout: 30000
          });
          const pdfBuffer = await page.pdf(pdfOptions);
          resolve(Buffer.from(pdfBuffer));
        } catch (error) {
          console.error('PDF generation error:', error);
          // If Chrome crashed, clear the instance so next request relaunches
          if (browserInstance && !browserInstance.connected) {
            browserInstance = null;
          }
          reject(new Error('Failed to generate PDF: ' + error.message));
        } finally {
          if (page) {
            await page.close().catch(() => {});
          }
        }
      });
    });

    return result;
  }

  // Graceful shutdown
  static async close() {
    if (browserInstance) {
      await browserInstance.close().catch(() => {});
      browserInstance = null;
    }
  }
}

module.exports = PdfGenerator;
