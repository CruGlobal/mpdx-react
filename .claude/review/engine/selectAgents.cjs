'use strict';
const { minimatch } = require('minimatch');

const OPTS = { dot: true };

function isExcluded(file, config) {
  return (config.excluded_paths || []).some((g) => minimatch(file, g, OPTS));
}

// The reviewer's own definition files legitimately contain trigger vocabulary as DATA
// (config.yml lists the trigger keywords; rule docs describe them). Scanning them for content
// triggers self-matches. Drop them — plus markdown/docs and excluded paths — from content scanning.
const DEFN_RE = /(^|\/)\.claude\/review\/config(\.schema)?\.(ya?ml|json)$/;

// Keep only diff hunks for reviewable CODE files so content triggers match real code, not prose
// or the reviewer's own config/rule definitions.
function codeDiff(diffText, config) {
  if (!diffText) return '';
  const blocks = diffText.split(/(?=^diff --git )/m);
  const kept = [];
  for (const b of blocks) {
    const m = b.match(/^diff --git a\/\S+ b\/(\S+)/m);
    if (!m) {
      kept.push(b); // preamble or a non-`diff --git` snippet — keep (back-compat for raw snippets)
      continue;
    }
    const file = m[1];
    if (file.endsWith('.md') || DEFN_RE.test(file) || isExcluded(file, config)) continue;
    kept.push(b);
  }
  return kept.join('');
}

function agentMatches(agent, files, contentText) {
  if (agent.always) return 'always';
  const t = agent.triggers || {};
  for (const f of files) {
    for (const g of t.paths || []) {
      if (minimatch(f, g, OPTS)) return `path:${g}`;
    }
  }
  for (const c of t.content || []) {
    if (contentText.includes(c)) return `content:${c}`;
  }
  return null;
}

function selectAgents({ files, diffText }, config) {
  const reviewed = files.filter((f) => !isExcluded(f, config));
  const contentText = codeDiff(diffText, config);
  const out = [];
  for (const a of config.agents) {
    if (a.enabled === false) continue;
    const matchedBy = agentMatches(a, reviewed, contentText);
    if (matchedBy) out.push({ id: a.id, model: a.model || 'smart', matchedBy });
  }
  return out;
}

module.exports = { selectAgents, agentMatches, codeDiff };
