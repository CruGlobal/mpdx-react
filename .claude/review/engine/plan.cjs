'use strict';
const { readFileSync } = require('node:fs');
const { parseArgs } = require('./args.cjs');
const { loadConfig } = require('./loadConfig.cjs');
const { scoreRisk } = require('./scoreRisk.cjs');
const { selectAgents } = require('./selectAgents.cjs');
const { resolveRules } = require('./resolveRules.cjs');
const { detectSpecial } = require('./detectSpecial.cjs');

function buildPlan({ files, diffText, linesChanged, scope }, config) {
  const special = detectSpecial(diffText, files, config);
  const risk = scoreRisk({ files, linesChanged, scope, special }, config);
  const selected = selectAgents({ files, diffText }, config);
  const agents = selected.map((a) => ({ ...a, rules: resolveRules(a.id, files, config) }));
  return { profile: config.profile, risk: { ...risk, special }, agents };
}

function linesChangedFromStat(statText) {
  const ins = statText.match(/(\d+) insertions?\(\+\)/);
  const del = statText.match(/(\d+) deletions?\(-\)/);
  return (ins ? Number(ins[1]) : 0) + (del ? Number(del[1]) : 0);
}

if (require.main === module) {
  const a = parseArgs(process.argv.slice(2));
  const config = loadConfig({ configPath: a.config, schemaPath: a.schema });
  const files = readFileSync(a.files, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
  const diffText = a.diff ? readFileSync(a.diff, 'utf8') : '';
  const linesChanged = a.stat ? linesChangedFromStat(readFileSync(a.stat, 'utf8')) : 0;
  const plan = buildPlan({ files, diffText, linesChanged, scope: a.scope || 'single_feature' }, config);
  process.stdout.write(JSON.stringify(plan, null, 2) + '\n');
}

module.exports = { buildPlan, parseArgs, linesChangedFromStat };
