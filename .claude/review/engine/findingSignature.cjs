'use strict';
const { createHash } = require('node:crypto');

function normalizeMessage(msg) {
  return String(msg || '')
    .toLowerCase()
    .replace(/['"`][^'"`]*['"`]/g, ' ') // strip quoted identifiers
    .replace(/\d+/g, ' ')               // strip digits
    .replace(/\s+/g, ' ')
    .trim();
}

function topDir(file) {
  const parts = String(file || '').split('/').filter(Boolean);
  return parts.slice(0, 2).join('/');
}

function signature(finding) {
  const key = [
    finding.agent || '',
    finding.category || '',
    normalizeMessage(finding.message),
    topDir(finding.file),
  ].join('|');
  return createHash('sha1').update(key).digest('hex').slice(0, 12);
}

module.exports = { signature, normalizeMessage, topDir };
