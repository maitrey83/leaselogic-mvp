const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PdfGenerator {
  /**
   * Find the Chrome executable installed by Puppeteer.
   * On Render, the cache lives at /opt/render/.cache/puppeteer and the
   * version directory name changes with each Puppeteer update, so we
   * resolve it dynamically rather than hard-coding a glob in an env var.
   */
  static findChromePath() {
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      // Explicit override always wins (if it exists on disk)
      if (fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
        return process.env.PUPPETEER_EXECUTABLE_PATH;
      }
    }

    // Search the Puppeteer cache directory for installed Chrome
    const cacheDir = path.join(
      process.env.PUPPETEER_CACHE_DIR || path.join(require('os').homedir(), '.cache', 'puppeteer'),
      'chrome'
    );

    if (fs.existsSync(cacheDir)) {
      const versions = fs.readdirSync(cacheDir).filter(d => d.startsWith('linux-'));
      if (versions.length > 0) {
        const chromePath = path.join(cacheDir, versions[0], 'chrome-linux64', 'chrome');
        if (fs.existsSync(chromePath)) {
          return chromePath;
        }
      }
    }

    // Fall back to Puppeteer's default (works locally on macOS/Windows)
    return undefined;
  }

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
      const launchOptions = {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process'
        ]
      };

      const chromePath = PdfGenerator.findChromePath();
      if (chromePath) {
        launchOptions.executablePath = chromePath;
      }

      browser = await puppeteer.launch(launchOptions);

      const page = await browser.newPage();
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      const pdfBuffer = await page.pdf(pdfOptions);
      // Ensure we return a proper Node.js Buffer (Puppeteer may return Uint8Array)
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
