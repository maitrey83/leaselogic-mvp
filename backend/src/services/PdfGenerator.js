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
      if (fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
        return process.env.PUPPETEER_EXECUTABLE_PATH;
      }
    }

    // Candidate cache directories — project-local first (Render), then home dir
    const candidateDirs = [
      path.join(__dirname, '..', '..', '.cache', 'puppeteer', 'chrome'),  // backend/.cache/puppeteer/chrome
      path.join(require('os').homedir(), '.cache', 'puppeteer', 'chrome'),
    ];

    if (process.env.PUPPETEER_CACHE_DIR) {
      candidateDirs.unshift(path.join(process.env.PUPPETEER_CACHE_DIR, 'chrome'));
    }

    for (const cacheDir of candidateDirs) {
      if (!fs.existsSync(cacheDir)) continue;
      const versions = fs.readdirSync(cacheDir).filter(d => d.startsWith('linux-') || d.startsWith('mac-') || d.startsWith('win'));
      if (versions.length === 0) continue;
      // Try common Chrome binary locations per platform
      const binPaths = [
        path.join(cacheDir, versions[0], 'chrome-linux64', 'chrome'),
        path.join(cacheDir, versions[0], 'chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
        path.join(cacheDir, versions[0], 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
      ];
      for (const binPath of binPaths) {
        if (fs.existsSync(binPath)) {
          console.log(`Chrome found at: ${binPath}`);
          return binPath;
        }
      }
    }

    console.warn('Chrome not found in any cache directory, falling back to Puppeteer default');
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
