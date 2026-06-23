'use strict';
// Requires every *.test.cjs here so node:test runs them in ONE process.
// (yarn node injects the PnP loader; node --test workers would not — do not use --test.)
const { readdirSync } = require('node:fs');
const { join } = require('node:path');

for (const f of readdirSync(__dirname).sort()) {
  if (f.endsWith('.test.cjs')) require(join(__dirname, f));
}
