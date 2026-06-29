'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { selectAgents } = require('./selectAgents.cjs');

const config = {
  excluded_paths: ['**/*.snap'],
  agents: [
    { id: 'architecture', always: true },
    { id: 'testing', always: true },
    { id: 'standards', always: true },
    { id: 'security', triggers: { paths: ['pages/api/**'], content: ['process.env.'] } },
    { id: 'ux', model: 'opus', triggers: { paths: ['src/components/**/*.tsx'] } },
    { id: 'financial', enabled: false, triggers: { paths: ['src/components/Reports/**'] } },
  ],
};

test('UI-only change selects always-on agents + ux', () => {
  const sel = selectAgents({ files: ['src/components/Tasks/TaskRow.tsx'], diffText: '+ const x = 1;' }, config);
  assert.deepEqual(sel.map((a) => a.id).sort(), ['architecture', 'standards', 'testing', 'ux']);
  assert.equal(sel.find((a) => a.id === 'ux').model, 'opus');
});

test('content trigger selects security via process.env', () => {
  const sel = selectAgents({ files: ['src/lib/foo.ts'], diffText: '+ const k = process.env.SECRET;' }, config);
  assert.ok(sel.some((a) => a.id === 'security' && a.matchedBy === 'content:process.env.'));
});

test('disabled agent never selected', () => {
  const sel = selectAgents({ files: ['src/components/Reports/Report.tsx'], diffText: '' }, config);
  assert.ok(!sel.some((a) => a.id === 'financial'));
});
