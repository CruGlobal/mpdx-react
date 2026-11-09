// Rebuilds timings.json from the jest-timings-* artifacts CI uploads, so sequencer.js keeps the
// test chunks balanced. Pass the folder(s) of one or more full CI runs; each file's time is the
// median of what those runs measured.
//
//   gh run download <run-id> -p 'jest-timings-*' -D /tmp/jest-timings/<run-id>
//   node scripts/jest-shards/mergeTimings.js /tmp/jest-timings
const fs = require('fs');
const path = require('path');

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
 * @returns {Record<string, number>}
 */
const mergeTimings = (runs) => {
  /** @type {Map<string, number[]>} */
  const observed = new Map();
  runs.forEach((timings) =>
    Object.entries(timings).forEach(([file, ms]) =>
      observed.set(file, [...(observed.get(file) ?? []), ms]),
    ),
  );
  return Object.fromEntries(
    [...observed.keys()]
      .sort()
      .map((file) => [
        file,
        median(/** @type {number[]} */ (observed.get(file))),
      ]),
  );
};

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
  const merged = mergeTimings(runs);
  fs.writeFileSync(
    path.join(__dirname, 'timings.json'),
    `${JSON.stringify(merged, null, 2)}\n`,
  );
  process.stdout.write(
    `Wrote ${Object.keys(merged).length} test files from ${runs.length} timing files.\n`,
  );
}

module.exports = { mergeTimings, readTimingFiles };
