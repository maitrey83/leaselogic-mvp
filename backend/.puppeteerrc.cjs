const { join } = require('path');

/**
 * Puppeteer configuration — tells both `npm install` (postinstall)
 * and `npx puppeteer browsers install chrome` to put Chrome inside
 * the project directory so it persists on Render's free tier.
 */
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
