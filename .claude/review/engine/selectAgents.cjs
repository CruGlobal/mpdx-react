'use strict';
const { minimatch } = require('minimatch');

const OPTS = { dot: true };

function agentMatches(agent, files, diffText) {
  if (agent.always) return 'always';
  const t = agent.triggers || {};
  for (const f of files) {
    for (const g of t.paths || []) {
      if (minimatch(f, g, OPTS)) return `path:${g}`;
    }
  }
  for (const c of t.content || []) {
    if (diffText.includes(c)) return `content:${c}`;
  }
  return null;
}

function selectAgents({ files, diffText }, config) {
  const reviewed = files.filter(
    (f) => !(config.excluded_paths || []).some((g) => minimatch(f, g, OPTS)),
  );
  const out = [];
  for (const a of config.agents) {
    if (a.enabled === false) continue;
    const matchedBy = agentMatches(a, reviewed, diffText);
    if (matchedBy) out.push({ id: a.id, model: a.model || 'smart', matchedBy });
  }
  return out;
}

module.exports = { selectAgents, agentMatches };
