// Writes this run's per-file test durations (ms) to $JEST_TIMINGS_FILE for mergeTimings.js.
const fs = require('fs');
const { repoPath } = require('./repoPath');

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
          repoPath(this.rootDir, testFilePath),
          perfStats.runtime,
        ]),
    );
    try {
      fs.writeFileSync(file, `${JSON.stringify(timings, null, 2)}\n`);
    } catch (error) {
      process.stderr.write(
        `Could not write test timings to ${file}: ${error}\n`,
      );
    }
  }
}

module.exports = TimingsReporter;
