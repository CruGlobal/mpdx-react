'use strict';
const { readFileSync } = require('node:fs');
const { parse } = require('yaml');
const Ajv = require('ajv/dist/2020');

function parseConfig(yamlText) {
  return parse(yamlText);
}

function validateConfig(configObj, schemaObj) {
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schemaObj);
  const valid = validate(configObj);
  const errors = valid
    ? []
    : (validate.errors || []).map((e) => `${e.instancePath || '(root)'} ${e.message}`);
  return { valid, errors };
}

function loadConfig({ configPath, schemaPath }) {
  const configObj = parseConfig(readFileSync(configPath, 'utf8'));
  const schemaObj = JSON.parse(readFileSync(schemaPath, 'utf8'));
  const { valid, errors } = validateConfig(configObj, schemaObj);
  if (!valid) {
    throw new Error(`Invalid review config (${configPath}):\n- ${errors.join('\n- ')}`);
  }
  return configObj;
}

module.exports = { parseConfig, validateConfig, loadConfig };
