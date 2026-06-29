'use strict';
const { minimatch } = require('minimatch');

const OPTS = { dot: true };

function resolveRules(agentId, files, config) {
  const agent = (config.agents || []).find((a) => a.id === agentId);
  const rules = [];
  const seen = new Set();
  const add = (r) => {
    if (!seen.has(r)) {
      seen.add(r);
      rules.push(r);
    }
  };
  for (const r of (agent && agent.rules) || []) add(r);
  for (const pr of config.path_rules || []) {
    if (files.some((f) => pr.paths.some((g) => minimatch(f, g, OPTS)))) {
      for (const r of pr.rules) add(r);
    }
  }
  return rules;
}

module.exports = { resolveRules };
