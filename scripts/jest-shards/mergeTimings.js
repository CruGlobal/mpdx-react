// Rebuilds timings.json from the jest-timings-* artifacts CI uploads, so sequencer.js keeps the
// test chunks balanced. Pass the folder(s) of one or more CI runs; each file's time is the
// median of what those runs measured. Files no run measured keep their earlier time while
// the test file still exists, so a missing artifact can't reset them to the average.
//
//   rm -rf /tmp/jest-timings
//   gh run download <run-id> -p 'jest-timings-*' -D /tmp/jest-timings/<run-id>
//   node scripts/jest-shards/mergeTimings.js /tmp/jest-timings
const fs = require('fs');
const path = require('path');

const TIMINGS_PATH = path.join(__dirname, 'timings.json');
const REPO_ROOT = path.join(__dirname, '..', '..');

/** @param {number[]} values */
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
};

/**
 * @param {Record<string, number>[]} runs
 * @param {Record<string, number>} [previous] the current timings.json
 * @param {(file: string) => boolean} [exists]
 * @returns {Record<string, number>}
 */
const mergeTimings = (
  runs,
  previous = {},
  exists = (file) => fs.existsSync(path.join(REPO_ROOT, file)),
) => {
  /** @type {Map<string, number[]>} */
  const observed = new Map();
  runs.forEach((timings) =>
    Object.entries(timings).forEach(([file, ms]) =>
      observed.set(file, [...(observed.get(file) ?? []), ms]),
    ),
  );
  /** @type {Map<string, number>} */
  const merged = new Map(
    Object.entries(previous).filter(([file]) => exists(file)),
  );
  observed.forEach((times, file) => {
    if (exists(file)) {
      merged.set(file, median(times));
    }
  });
  return Object.fromEntries([...merged].sort(([a], [b]) => (a < b ? -1 : 1)));
};

/**
 * Only a missing file starts empty; a broken one throws rather than losing its times.
 * @param {string} file
 * @returns {Record<string, number>}
 */
const readPrevious = (file) =>
  fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};

/**
 * @param {string} dir
 * @returns {Record<string, number>[]}
 */
const readTimingFiles = (dir) =>
  fs
    .readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.json'))
    .map((file) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')));

if (require.main === module) {
  const runs = process.argv.slice(2).flatMap(readTimingFiles);
  if (runs.length === 0) {
    process.stderr.write(
      'No timing files found. Pass the folder gh run download wrote to.\n',
    );
    process.exit(1);
  }
  const merged = mergeTimings(runs, readPrevious(TIMINGS_PATH));
  const measured = new Set(runs.flatMap((timings) => Object.keys(timings)));
  const kept = Object.keys(merged).filter((file) => !measured.has(file));
  fs.writeFileSync(TIMINGS_PATH, `${JSON.stringify(merged, null, 2)}\n`);
  process.stdout.write(
    `Wrote ${Object.keys(merged).length} test files from ${runs.length} timing files; ${kept.length} kept their earlier time because no run measured them.\n`,
  );
}

module.exports = { mergeTimings, readPrevious, readTimingFiles };
