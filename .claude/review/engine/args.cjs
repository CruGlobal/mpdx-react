'use strict';
// Single shared CLI argument parser used by every engine entry point (no per-module drift).
// A `--flag` with no following value, or followed by another `--flag`, is boolean `true`;
// otherwise it consumes the next token as its value.
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (!tok.startsWith('--')) continue;
    const key = tok.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

module.exports = { parseArgs };
