'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
// Schema uses the JSON Schema draft 2020-12 dialect; Ajv's 2020 entry point
// ships that meta-schema (the default `ajv` export only knows draft-07).
const Ajv = require('ajv/dist/2020').default || require('ajv/dist/2020');
const schema = require('../config.schema.json');

test('config.schema.json is a valid, compilable JSON Schema', () => {
  const validate = new Ajv({ allErrors: true }).compile(schema); // throws if malformed
  assert.equal(typeof validate, 'function');
});
