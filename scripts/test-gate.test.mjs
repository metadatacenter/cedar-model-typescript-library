import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

function gate(workers, fail = '') {
  const directory = mkdtempSync(path.join(tmpdir(), 'model-gate-'));
  const log = path.join(directory, 'events');
  writeFileSync(
    path.join(directory, 'npm'),
    `#!${process.execPath}
const fs = require('node:fs');
const script = process.argv[3];
const emit = event => fs.appendFileSync(process.env.GATE_LOG, JSON.stringify({event, script, workers: process.env.CEDAR_TEST_WORKERS})+'\\n');
emit('start');
setTimeout(() => { emit('end'); process.exit(script === process.env.GATE_FAIL ? 7 : 0); }, 50);
`,
    { mode: 0o755 },
  );
  try {
    const result = spawnSync(process.execPath, [fileURLToPath(new URL('./test-gate.mjs', import.meta.url))], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${directory}:${process.env.PATH}`,
        CEDAR_TEST_WORKERS: String(workers),
        GATE_LOG: log,
        GATE_FAIL: fail,
      },
    });
    return {
      result,
      events: readFileSync(log, 'utf8')
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line)),
    };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

for (const budget of [1, 2, 8])
  test(`all checks pass within ${budget} workers`, () => {
    const { result, events } = gate(budget);
    assert.equal(result.status, 0, result.stderr);
    let active = 0;
    const completed = [];
    for (const event of events) {
      active += (event.event === 'start' ? 1 : -1) * Number(event.workers);
      assert.ok(active >= 0 && active <= budget);
      if (event.event === 'end') completed.push(event.script);
      else if (event.script !== 'test:fixtures') assert.ok(completed.includes('test:fixtures'));
    }
    assert.equal(active, 0);
    assert.deepEqual(completed.sort(), [
      'lint',
      'parity:json',
      'parity:yaml',
      'test:coverage:prepared',
      'test:fixtures',
      'test:package',
      'typecheck',
    ]);
  });

test('failure stops queued checks and exits nonzero', () => {
  const { result, events } = gate(1, 'test:coverage:prepared');
  assert.notEqual(result.status, 0);
  assert.deepEqual(
    events.map((e) => [e.event, e.script]),
    [
      ['start', 'test:fixtures'],
      ['end', 'test:fixtures'],
      ['start', 'test:coverage:prepared'],
      ['end', 'test:coverage:prepared'],
    ],
  );
});

test('parallel failure drains everything already running', () => {
  const { result, events } = gate(8, 'test:coverage:prepared');
  assert.notEqual(result.status, 0);
  const starts = events
    .filter((e) => e.event === 'start')
    .map((e) => e.script)
    .sort();
  const ends = events
    .filter((e) => e.event === 'end')
    .map((e) => e.script)
    .sort();
  assert.deepEqual(starts, ends);
});

test('fixture generation failure blocks every reader and package check', () => {
  const { result, events } = gate(8, 'test:fixtures');
  assert.notEqual(result.status, 0);
  assert.deepEqual(
    events.map((event) => [event.event, event.script]),
    [
      ['start', 'test:fixtures'],
      ['end', 'test:fixtures'],
    ],
  );
});
