// Writes this run's per-file test durations (ms) to $JEST_TIMINGS_FILE for mergeTimings.js.
const fs = require('fs');
const path = require('path');

class TimingsReporter {
  /** @param {{ rootDir: string }} globalConfig */
  constructor(globalConfig) {
    this.rootDir = globalConfig.rootDir;
  }

  /**
   * @param {unknown} _contexts
   * @param {{ testResults: { testFilePath: string, perfStats: { runtime: number } }[] }} results
   */
  onRunComplete(_contexts, results) {
    const file = process.env.JEST_TIMINGS_FILE;
    if (!file) {
      return;
    }
    const timings = Object.fromEntries(
      results.testResults
        .filter(({ perfStats }) => perfStats.runtime > 0)
        .map(({ testFilePath, perfStats }) => [
          path.relative(this.rootDir, testFilePath).split(path.sep).join('/'),
          perfStats.runtime,
        ]),
    );
    fs.writeFileSync(file, `${JSON.stringify(timings, null, 2)}\n`);
  }
}

module.exports = TimingsReporter;
