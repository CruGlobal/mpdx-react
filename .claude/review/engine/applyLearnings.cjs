'use strict';

function filterFindings(findings, approved) {
  const sigs = new Set((approved || []).filter((l) => l.kind === 'suppress').map((l) => l.signature));
  const kept = [];
  const suppressed = [];
  for (const f of findings) {
    if (sigs.has(f.signature)) suppressed.push(f);
    else kept.push(f);
  }
  return { kept, suppressed };
}

function rulesFromLearnings(approved) {
  return (approved || [])
    .filter((l) => l.kind === 'rule')
    .map((l) => ({ paths: l.paths || [], ruleText: l.ruleText || l.example || '', agent: l.agent }));
}

module.exports = { filterFindings, rulesFromLearnings };
