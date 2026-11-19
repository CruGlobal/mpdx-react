// timings.json keys (timingsReporter.js) and sequencer.js lookups must normalize paths the same way.
const path = require('path');

/**
 * @param {string} rootDir
 * @param {string} file
 */
const repoPath = (rootDir, file) =>
  path.relative(rootDir, file).split(path.sep).join('/');

module.exports = { repoPath };
