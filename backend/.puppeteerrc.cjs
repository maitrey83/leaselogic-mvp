const { join } = require('path');

/**
 * Puppeteer configuration — store Chrome inside node_modules so it
 * persists on Render. Render only keeps node_modules/ and git-tracked
 * files between build and runtime; ~/.cache and .cache/ are wiped.
 */
module.exports = {
  cacheDirectory: join(__dirname, 'node_modules', '.puppeteer-cache'),
};
