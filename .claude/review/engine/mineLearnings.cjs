'use strict';
const { topDir } = require('./findingSignature.cjs');

function mineLearnings(feedbackEntries, opts = {}) {
  const minSupport = opts.minSupport ?? 3;
  const groups = new Map();
  for (const e of feedbackEntries) {
    if (!e.signature) continue;
    if (!groups.has(e.signature)) groups.set(e.signature, []);
    groups.get(e.signature).push(e);
  }
  const proposals = [];
  for (const [sig, entries] of groups) {
    const total = entries.length;
    if (total < minSupport) continue;
    const dismissed = entries.filter((e) => e.outcome === 'dismissed').length;
    const accepted = entries.filter((e) => e.outcome === 'accepted').length;
    const sample = entries[0];
    const base = {
      id: `L-${sig}`,
      signature: sig,
      agent: sample.agent,
      category: sample.category,
      paths: [`${topDir(sample.file)}/**`],
      support: total,
      example: sample.message,
    };
    if (dismissed / total >= 0.75) {
      proposals.push({ ...base, kind: 'suppress', status: 'proposed', rationale: `Dismissed ${dismissed}/${total} times` });
    } else if (accepted / total >= 0.75) {
      proposals.push({ ...base, kind: 'rule', status: 'proposed', ruleText: sample.message, rationale: `Accepted ${accepted}/${total} times` });
    }
  }
  return proposals;
}

module.exports = { mineLearnings };
