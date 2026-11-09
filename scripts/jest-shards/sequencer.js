// Splits `jest --shard` runs by each test file's measured duration, so CI chunks finish together.
// Every chunk computes the full split independently, so it must be a pure function of the
// test file list and timings.json: integer weights, ties broken by path.
const fs = require('fs');
const path = require('path');
const Sequencer = require('@jest/test-sequencer').default;
const { repoPath } = require('./repoPath');

const TIMINGS_PATH = path.join(__dirname, 'timings.json');

/** @param {unknown} value */
const isTimingsMap = (value) => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (Array.isArray(value)) {
    return false;
  }
  const values = Object.values(value);
  return (
    values.length > 0 && values.every((ms) => Number.isInteger(ms) && ms >= 0)
  );
};

/**
 * @param {string} file
 * @returns {Record<string, number> | null} file path -> milliseconds, or null when unusable
 */
const loadTimings = (file) => {
  let timings;
  try {
    timings = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
  return isTimingsMap(timings) ? timings : null;
};

/**
 * Files missing from the timings (new tests) weigh the mean of the known ones. Every weight is
 * at least 1, so zero-time files still spread across shards.
 * @param {string[]} files
 * @param {Record<string, number>} timings
 * @returns {Map<string, number>}
 */
const weighFiles = (files, timings) => {
  const known = files.filter((file) => file in timings);
  const total = known.reduce((sum, file) => sum + timings[file], 0);
  const fallback = known.length ? Math.round(total / known.length) : 1;
  return new Map(
    files.map((file) => [
      file,
      Math.max(1, file in timings ? timings[file] : fallback),
    ]),
  );
};

/** @param {Map<string, number>} weights */
const longestFirst =
  (weights) => (/** @type {string} */ a, /** @type {string} */ b) =>
    /** @type {number} */ (weights.get(b)) -
      /** @type {number} */ (weights.get(a)) || (a < b ? -1 : 1);

/**
 * Longest-first greedy packing: each file goes to the lightest shard so far.
 * @param {Map<string, number>} weights
 * @param {number} shardCount
 * @returns {string[][]}
 */
const planShards = (weights, shardCount) => {
  const shards = Array.from({ length: shardCount }, () => ({
    total: 0,
    files: /** @type {string[]} */ ([]),
  }));
  [...weights.keys()].sort(longestFirst(weights)).forEach((file) => {
    const lightest = shards.reduce((min, shard) =>
      shard.total < min.total ? shard : min,
    );
    lightest.total += /** @type {number} */ (weights.get(file));
    lightest.files.push(file);
  });
  return shards.map((shard) => shard.files);
};

/** @param {{ path: string, context: { config: { rootDir: string } } }} test */
const relativePath = (test) => repoPath(test.context.config.rootDir, test.path);

class DurationSequencer extends Sequencer {
  constructor() {
    super();
    /** @type {() => Record<string, number> | null} replaced in specs */
    this.readTimings = () => loadTimings(TIMINGS_PATH);
    /** @type {Map<string, number> | null} */
    this.weights = null;
  }

  /** @type {Sequencer['shard']} */
  shard(tests, options) {
    const timings = this.readTimings();
    if (!timings) {
      process.stderr.write(
        `No usable test timings in ${TIMINGS_PATH}; falling back to Jest's default shard split.\n`,
      );
      return super.shard(tests, options);
    }
    const testsByPath = new Map(
      tests.map((test) => [relativePath(test), test]),
    );
    this.weights = weighFiles([...testsByPath.keys()], timings);
    const shard = planShards(this.weights, options.shardCount)[
      options.shardIndex - 1
    ];
    return shard.map(
      (file) => /** @type {typeof tests[number]} */ (testsByPath.get(file)),
    );
  }

  /** @type {Sequencer['sort']} */
  sort(tests) {
    const weights = this.weights;
    if (!weights) {
      return super.sort(tests);
    }
    const order = longestFirst(weights);
    return tests
      .map((test) => ({ test, file: relativePath(test) }))
      .sort((a, b) => order(a.file, b.file))
      .map(({ test, file }) => {
        // Jest's scheduler reads the duration the default sort would have set
        test.duration = weights.get(file);
        return test;
      });
  }
}

module.exports = DurationSequencer;
module.exports.loadTimings = loadTimings;
module.exports.weighFiles = weighFiles;
module.exports.planShards = planShards;
