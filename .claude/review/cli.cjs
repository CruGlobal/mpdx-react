'use strict';
const { join } = require('node:path');
const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { loadConfig } = require('./engine/loadConfig.cjs');
const { buildPlan } = require('./engine/plan.cjs');
const { loadOrBuildIndex, gitHead, listRepoFiles } = require('./engine/indexStore.cjs');
const { queryImpact } = require('./engine/queryImpact.cjs');
const { mineLearnings } = require('./engine/mineLearnings.cjs');
const { parsePending, appendFeedback, loadFeedback, loadLearnings, saveLearnings, mergeProposals } = require('./engine/learningsStore.cjs');
const { setLearningStatus, listLearnings, preflightSummary } = require('./engine/cliCommands.cjs');

const ROOT = process.cwd();
const RD = join(ROOT, '.claude/review');
const CONFIG = join(RD, 'config.yml');
const SCHEMA = join(RD, 'config.schema.json');
const INDEX = join(RD, 'index');
const FEEDBACK = join(RD, 'learnings/feedback.jsonl');
const LEARNINGS = join(RD, 'learnings/learnings.yml');

function out(s) { process.stdout.write(s + '\n'); }
function flag(argv, name) { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; }

function changedFiles(base) {
  let b = base;
  if (!b) {
    try { b = execFileSync('git', ['-C', ROOT, 'merge-base', 'main', 'HEAD'], { encoding: 'utf8' }).trim(); }
    catch { b = 'HEAD~1'; }
  }
  const files = execFileSync('git', ['-C', ROOT, 'diff', '--name-only', `${b}...HEAD`], { encoding: 'utf8' })
    .split('\n').map((s) => s.trim()).filter(Boolean);
  return { base: b, files };
}

function loadIndex() {
  return loadOrBuildIndex({ repoRoot: ROOT, indexPath: INDEX, head: gitHead(ROOT), files: listRepoFiles(ROOT) });
}

const USAGE = `usage: yarn review <command>
  config show|validate        show or validate the review config
  index                       rebuild the import-graph cache
  impact [--base <ref>]       cross-file blast radius for the current diff
  feedback <pendingFile>      ingest marked outcomes
  learn [--min-support N]      mine feedback into proposed learnings
  learnings [--status S]       list learnings
  approve <id> | reject <id>   set a learning's status
  run [--base <ref>] [mode]    pre-flight + launch the Claude Code review
  help`;

function main(argv) {
  const cmd = argv[0];
  const rest = argv.slice(1);
  switch (cmd) {
    case 'config': {
      const cfg = loadConfig({ configPath: CONFIG, schemaPath: SCHEMA });
      out(rest[0] === 'validate' ? 'config OK' : JSON.stringify(cfg, null, 2));
      return 0;
    }
    case 'index': {
      const g = loadIndex();
      out(`Indexed ${g.fileCount} files; ${Object.keys(g.importedBy).length} have dependents.`);
      return 0;
    }
    case 'impact': {
      const { files } = changedFiles(flag(rest, '--base'));
      out(JSON.stringify(queryImpact(files, loadIndex(), {}), null, 2));
      return 0;
    }
    case 'feedback': {
      if (!rest[0]) { out('usage: yarn review feedback <pendingFile>'); return 1; }
      const entries = parsePending(readFileSync(rest[0], 'utf8')).map((e) => ({ ts: new Date().toISOString(), ...e }));
      appendFeedback(FEEDBACK, entries);
      out(`Ingested ${entries.length} outcomes`);
      return 0;
    }
    case 'learn': {
      const minSupport = flag(rest, '--min-support') ? Number(flag(rest, '--min-support')) : 3;
      const proposals = mineLearnings(loadFeedback(FEEDBACK), { minSupport });
      const merged = mergeProposals(loadLearnings(LEARNINGS), proposals);
      saveLearnings(LEARNINGS, merged);
      out(`Mined ${proposals.length} proposals; ${merged.learnings.length} total`);
      return 0;
    }
    case 'learnings': {
      out(JSON.stringify(listLearnings(loadLearnings(LEARNINGS), flag(rest, '--status')), null, 2));
      return 0;
    }
    case 'approve':
    case 'reject': {
      if (!rest[0]) { out(`usage: yarn review ${cmd} <id>`); return 1; }
      const status = cmd === 'approve' ? 'approved' : 'rejected';
      saveLearnings(LEARNINGS, setLearningStatus(loadLearnings(LEARNINGS), rest[0], status));
      out(`${rest[0]} -> ${status}`);
      return 0;
    }
    case 'run': {
      const { writeFileSync } = require('node:fs');
      const os = require('node:os');
      const base = flag(rest, '--base');
      const mode = rest.find((a) => !a.startsWith('--') && a !== base) || 'standard';
      const { base: b, files } = changedFiles(base);
      const diff = execFileSync('git', ['-C', ROOT, 'diff', `${b}...HEAD`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      const stat = execFileSync('git', ['-C', ROOT, 'diff', '--stat', `${b}...HEAD`], { encoding: 'utf8' });
      const ins = stat.match(/(\d+) insertions?\(\+\)/);
      const del = stat.match(/(\d+) deletions?\(-\)/);
      const linesChanged = (ins ? Number(ins[1]) : 0) + (del ? Number(del[1]) : 0);
      const cfg = loadConfig({ configPath: CONFIG, schemaPath: SCHEMA });
      const plan = buildPlan({ files, diffText: diff, linesChanged, scope: 'multi_feature' }, cfg);
      let impact = null;
      if (cfg.index && cfg.index.enabled) impact = queryImpact(files, loadIndex(), {});
      out(preflightSummary(plan, impact));
      writeFileSync(join(os.tmpdir(), 'review_plan.json'), JSON.stringify({ ...plan, impact }, null, 2));
      if (rest.includes('--no-launch')) {
        out(`\nwould run: claude -p "/agent-review ${mode}"`);
        return 0;
      }
      out(`\nlaunching: claude -p "/agent-review ${mode}" ...\n`);
      try {
        execFileSync('claude', ['-p', `/agent-review ${mode}`], { stdio: 'inherit' });
      } catch (e) {
        out(`(could not launch claude automatically: ${e.message})`);
        out(`Run it manually in Claude Code:  /agent-review ${mode}`);
      }
      return 0;
    }
    case 'help':
    case undefined:
      out(USAGE);
      return 0;
    default:
      out(`unknown command: ${cmd}\n\n${USAGE}`);
      return 1;
  }
}

if (require.main === module) {
  try { process.exit(main(process.argv.slice(2))); }
  catch (e) { process.stderr.write(`error: ${e.message}\n`); process.exit(1); }
}

module.exports = { main };
