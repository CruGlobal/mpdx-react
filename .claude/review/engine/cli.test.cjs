'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { main } = require('../cli.cjs');

function run(args) {
  const orig = process.stdout.write.bind(process.stdout);
  let s = '';
  process.stdout.write = (x) => { s += x; return true; };
  let code;
  try { code = main(args); } finally { process.stdout.write = orig; }
  return { code, s };
}

test('help returns 0 and prints usage', () => {
  const { code, s } = run(['help']);
  assert.equal(code, 0);
  assert.match(s, /usage: yarn review/);
});

test('no command prints usage', () => {
  const { code, s } = run([]);
  assert.equal(code, 0);
  assert.match(s, /usage: yarn review/);
});

test('unknown command returns 1', () => {
  const { code, s } = run(['definitely-not-a-command']);
  assert.equal(code, 1);
  assert.match(s, /unknown command/);
});
