'use strict';

function setLearningStatus(learnings, id, status) {
  const list = (learnings && learnings.learnings) || [];
  if (!list.some((l) => l.id === id)) throw new Error(`Learning not found: ${id}`);
  return { ...learnings, learnings: list.map((l) => (l.id === id ? { ...l, status } : l)) };
}

function listLearnings(learnings, statusFilter) {
  const list = (learnings && learnings.learnings) || [];
  return list
    .filter((l) => !statusFilter || l.status === statusFilter)
    .map((l) => ({ id: l.id, kind: l.kind, status: l.status, support: l.support, paths: l.paths || [], example: l.example || l.ruleText || '' }));
}

function preflightSummary(plan, impact) {
  const lines = [];
  lines.push(`profile: ${plan.profile}`);
  const r = plan.risk;
  lines.push(`risk: ${r.score} ${r.level} (reviewer: ${r.reviewer})`);
  if (r.special && r.special.length) lines.push(`special: ${r.special.join(', ')}`);
  lines.push('agents:');
  for (const a of plan.agents) lines.push(`  - ${a.id} [${a.matchedBy}]`);
  if (impact) {
    lines.push(`impact: blastRadius ${impact.blastRadius}${impact.truncated ? ' (truncated)' : ''}`);
    for (const t of (impact.topImpacted || []).filter((x) => x.dependentCount > 0).slice(0, 5)) {
      lines.push(`  - ${t.dependentCount} dependents: ${t.file}`);
    }
  }
  return lines.join('\n');
}

module.exports = { setLearningStatus, listLearnings, preflightSummary };
