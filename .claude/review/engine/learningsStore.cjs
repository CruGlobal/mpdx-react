'use strict';
const { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } = require('node:fs');
const { join, dirname } = require('node:path');
const YAML = require('yaml');
const { signature } = require('./findingSignature.cjs');
const { mineLearnings } = require('./mineLearnings.cjs');
const { filterFindings, rulesFromLearnings } = require('./applyLearnings.cjs');

function mergeProposals(existing, proposals) {
  const out = { version: 1, learnings: [...((existing && existing.learnings) || [])] };
  const ids = new Set(out.learnings.map((l) => l.id));
  for (const p of proposals) {
    if (!ids.has(p.id)) {
      out.learnings.push(p);
      ids.add(p.id);
    } // existing entries keep their status
  }
  return out;
}

function parsePending(yamlText) {
  const doc = YAML.parse(yamlText) || {};
  const out = [];
  for (const f of doc.findings || []) {
    if (f.outcome === 'accepted' || f.outcome === 'dismissed') {
      out.push({
        reviewId: doc.reviewId, id: f.id, signature: f.signature, agent: f.agent,
        category: f.category, severity: f.severity, file: f.file, message: f.message, outcome: f.outcome,
      });
    }
  }
  return out;
}

function loadApproved(learnings) {
  return ((learnings && learnings.learnings) || []).filter((l) => l.status === 'approved');
}

function loadLearnings(path) {
  return existsSync(path) ? YAML.parse(readFileSync(path, 'utf8')) || { version: 1, learnings: [] } : { version: 1, learnings: [] };
}
function saveLearnings(path, obj) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, YAML.stringify(obj));
}
function loadFeedback(path) {
  if (!existsSync(path)) return [];
  const out = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch { /* skip malformed line */ }
  }
  return out;
}
function appendFeedback(path, entries) {
  mkdirSync(dirname(path), { recursive: true });
  for (const e of entries) appendFileSync(path, JSON.stringify(e) + '\n');
}

module.exports = { mergeProposals, parsePending, loadApproved, loadLearnings, saveLearnings, loadFeedback, appendFeedback };

if (require.main === module) {
  const argv = process.argv.slice(2);
  const base = join(process.cwd(), '.claude/review/learnings');
  const feedbackPath = join(base, 'feedback.jsonl');
  const learningsPath = join(base, 'learnings.yml');
  const findingsPath = join(base, 'findings.json');
  const flag = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };

  if (argv.includes('--emit')) {
    const raw = JSON.parse(readFileSync(flag('--in'), 'utf8'));
    const reviewId = flag('--review') || 'review';
    const findings = (raw.findings || raw).map((f, i) => ({ id: `f${i + 1}`, signature: signature(f), ...f }));
    mkdirSync(join(base, 'pending'), { recursive: true });
    writeFileSync(findingsPath, JSON.stringify({ reviewId, findings }, null, 2));
    const pending = { reviewId, findings: findings.map((f) => ({ id: f.id, signature: f.signature, agent: f.agent, category: f.category, severity: f.severity, file: f.file, message: f.message, outcome: '' })) };
    writeFileSync(join(base, 'pending', `${reviewId}.yml`), YAML.stringify(pending));
    process.stdout.write(`Emitted ${findings.length} findings; pending/${reviewId}.yml\n`);
  } else if (argv.includes('--ingest')) {
    const pendingFile = argv[argv.indexOf('--ingest') + 1];
    const entries = parsePending(readFileSync(pendingFile, 'utf8')).map((e) => ({ ts: new Date().toISOString(), ...e }));
    appendFeedback(feedbackPath, entries);
    process.stdout.write(`Ingested ${entries.length} outcomes\n`);
  } else if (argv.includes('--mine')) {
    const minSupport = flag('--min-support') ? Number(flag('--min-support')) : 3;
    const proposals = mineLearnings(loadFeedback(feedbackPath), { minSupport });
    const merged = mergeProposals(loadLearnings(learningsPath), proposals);
    saveLearnings(learningsPath, merged);
    process.stdout.write(`Mined ${proposals.length} proposals; ${merged.learnings.length} total\n`);
  } else if (argv.includes('--rules')) {
    process.stdout.write(JSON.stringify(rulesFromLearnings(loadApproved(loadLearnings(learningsPath))), null, 2) + '\n');
  } else if (argv.includes('--filter')) {
    const raw = JSON.parse(readFileSync(flag('--in') || findingsPath, 'utf8'));
    process.stdout.write(JSON.stringify(filterFindings(raw.findings || raw, loadApproved(loadLearnings(learningsPath))), null, 2) + '\n');
  } else {
    process.stdout.write('usage: learningsStore.cjs [--emit --in <json> --review <id> | --ingest <pending.yml> | --mine [--min-support N] | --rules | --filter --in <json>]\n');
  }
}
