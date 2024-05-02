import { execSync } from 'node:child_process';
import { unlinkSync } from 'node:fs';
import { relative } from 'node:path';

const normalize = (filename) => relative(process.cwd(), filename);

// This script receives the list of generated files, each in a separate argument.
// Some of them are relative to the project root, and some of them are absolute.
// Skip the first argument (node) and the second argument (the script filename)
// and convert to a newline-separated list of paths relative to the project root.
const filesToKeep = new Set(process.argv.slice(2).map(normalize));

const allFiles = execSync('find . -type f -name "*.generated.ts"')
  .toString()
  .trim()
  .split('\n')
  .map(normalize);

allFiles.forEach((filename) => {
  if (!filesToKeep.has(filename)) {
    unlinkSync(filename);
  }
});
