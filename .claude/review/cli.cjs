'use strict';
const { join } = require('node:path');
const { execFileSync } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const os = require('node:os');
const { loadConfig } = require('./engine/loadConfig.cjs');
const { buildPlan, linesChangedFromStat } = require('./engine/plan.cjs');
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
const MODES = ['quick', 'standard', 'deep'];

function out(s) { process.stdout.write(s + '\n'); }

// Returns the value after `name`, or undefined if absent or the next token is itself a flag.
function flag(argv, name) {
  const i = argv.indexOf(name);
  if (i < 0) return undefined;
  const v = argv[i + 1];
  return v === undefined || v.startsWith('--') ? undefined : v;
}

function validRef(ref) {
  return /^[A-Za-z0-9._/~^-]+$/.test(ref) && !ref.startsWith('-');
}

function changedFiles(base) {
  let b = base;
  if (b && !validRef(b)) throw new Error(`invalid --base ref: "${b}"`);
  if (!b) {
    try { b = execFileSync('git', ['-C', ROOT, 'merge-base', 'main', 'HEAD'], { encoding: 'utf8' }).trim(); }
    catch { b = 'HEAD~1'; }
  }
  let raw;
  try {
    raw = execFileSync('git', ['-C', ROOT, 'diff', '--name-only', `${b}...HEAD`], { encoding: 'utf8' });
  } catch (e) {
    throw new Error(`could not determine a diff base (tried "${b}"). Pass --base <ref>. [${e.message.split('\n')[0]}]`);
  }
  return { base: b, files: raw.split('\n').map((s) => s.trim()).filter(Boolean) };
}

function loadIndex(cfg) {
  const c = cfg || loadConfig({ configPath: CONFIG, schemaPath: SCHEMA });
  const indexPath = c.index && c.index.path ? join(ROOT, c.index.path) : INDEX;
  return loadOrBuildIndex({ repoRoot: ROOT, indexPath, head: gitHead(ROOT), files: listRepoFiles(ROOT) });
}

const USAGE = `usage: yarn review <command>
  config show|validate|get <k>  show / validate / read a config value
  index                         rebuild the import-graph cache
  impact [--base <ref>]         cross-file blast radius for the current diff
  feedback <pendingFile>        ingest marked outcomes
  learn [--min-support N]        mine feedback into proposed learnings
  learnings [--status S]         list learnings
  approve <id> | reject <id>     set a learning's status
  run [--base <ref>] [--scope <s>] [mode]   pre-flight + launch the Claude Code review
  help`;

function main(argv) {
  const cmd = argv[0];
  const rest = argv.slice(1);
  switch (cmd) {
    case 'config': {
      const cfg = loadConfig({ configPath: CONFIG, schemaPath: SCHEMA });
      if (rest[0] === 'validate') { out('config OK'); return 0; }
      if (rest[0] === 'get') {
        if (!rest[1]) { out('usage: yarn review config get <dot.path>'); return 1; }
        const val = rest[1].split('.').reduce((o, k) => (o == null ? undefined : o[k]), cfg);
        out(val !== null && typeof val === 'object' ? JSON.stringify(val) : String(val));
        return 0;
      }
      out(JSON.stringify(cfg, null, 2));
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
      let minSupport = 3;
      const ms = flag(rest, '--min-support');
      if (ms !== undefined) {
        const n = Number(ms);
        if (!Number.isInteger(n) || n < 1) { out('error: --min-support must be a positive integer'); return 1; }
        minSupport = n;
      }
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
      const base = flag(rest, '--base');
      const scope = flag(rest, '--scope') || 'single_feature';
      const mode = rest.find((a) => !a.startsWith('--') && a !== base && a !== scope) || 'standard';
      if (!MODES.includes(mode)) { out(`error: unknown mode "${mode}" (use ${MODES.join('/')})`); return 1; }
      const { base: b, files } = changedFiles(base);
      const diff = execFileSync('git', ['-C', ROOT, 'diff', `${b}...HEAD`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      const stat = execFileSync('git', ['-C', ROOT, 'diff', '--stat', `${b}...HEAD`], { encoding: 'utf8' });
      const cfg = loadConfig({ configPath: CONFIG, schemaPath: SCHEMA });
      const plan = buildPlan({ files, diffText: diff, linesChanged: linesChangedFromStat(stat), scope }, cfg);
      const impact = cfg.index && cfg.index.enabled ? queryImpact(files, loadIndex(cfg), {}) : null;
      out(preflightSummary(plan, impact));
      writeFileSync(join(os.tmpdir(), 'review_plan.json'), JSON.stringify({ ...plan, impact }, null, 2));
      if (rest.includes('--no-launch')) { out(`\nwould run: claude -p "/agent-review ${mode}"`); return 0; }
      out(`\nlaunching: claude -p "/agent-review ${mode}" ...\n`);
      try { execFileSync('claude', ['-p', `/agent-review ${mode}`], { stdio: 'inherit' }); }
      catch (e) {
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
