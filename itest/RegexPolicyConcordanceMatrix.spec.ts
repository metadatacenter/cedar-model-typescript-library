import { Worker } from 'node:worker_threads';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { RegexChecks, RegexPolicy, RegexWorker, REGEX_WORKER_SOURCE } from '../src/policy';

const bytes = readFileSync(join(__dirname, 'resources/concordance/regex-policy.json'));
const corpus = JSON.parse(bytes.toString()) as { cases: { id: string; pattern: string; value: string | null; expected: string }[] };
function factory(source = REGEX_WORKER_SOURCE): RegexWorker {
  const worker = new Worker(
    `const { parentPort } = require('node:worker_threads');
    globalThis.postMessage = (data) => parentPort.postMessage(data);
    parentPort.on('message', (data) => globalThis.onmessage({data}));\n${source}`,
    { eval: true },
  );
  const adapter: RegexWorker = {
    onmessage: null,
    onerror: null,
    postMessage: (value) => worker.postMessage(value),
    terminate: () => {
      void worker.terminate();
    },
  };
  worker.on('message', (data) => adapter.onmessage?.({ data }));
  worker.on('error', () => adapter.onerror?.());
  return adapter;
}
let policy: RegexPolicy;
beforeEach(() => {
  policy = new RegexPolicy({ workerFactory: factory, workTimeoutMs: 50 });
});
afterEach(() => policy.dispose());
test('pins the normative regex corpus to Java', () => {
  const lock = JSON.parse(readFileSync(join(__dirname, 'resources/concordance/regex-policy-lock.json'), 'utf8'));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(corpus.cases).toHaveLength(lock.caseCount);
});
test.each(corpus.cases)('$id', async ({ pattern, value, expected }) => {
  expect(await policy.evaluate(pattern, value)).toBe(expected);
});
test('terminates catastrophic evaluation and recovers for a queued request', async () => {
  const slow = policy.evaluate('(a+)+', 'a'.repeat(40) + '!');
  const next = policy.evaluate('a+', 'aaa');
  expect(await slow).toBe('timeout');
  expect(await next).toBe('match');
});
test('cancels running and queued requests without applying stale answers', async () => {
  const active = new AbortController(),
    queued = new AbortController();
  const first = policy.evaluate('(a+)+', 'a'.repeat(40) + '!', active.signal);
  const second = policy.evaluate('a+', 'a', queued.signal);
  queued.abort();
  active.abort();
  expect(await first).toBe('cancelled');
  expect(await second).toBe('cancelled');
  expect(await policy.evaluate('a+', 'a')).toBe('match');
  expect(await policy.evaluate('a', 'a', active.signal)).toBe('cancelled');
});
test('bounds queue, message size and lifetime', async () => {
  policy.dispose();
  policy = new RegexPolicy({ workerFactory: factory, queueLimit: 1 });
  const first = policy.evaluate('a', 'a'),
    second = policy.evaluate('b', 'b');
  expect(await policy.evaluate('c', 'c')).toBe('limit');
  expect(await policy.evaluate('a'.repeat(10001))).toBe('limit');
  expect(await policy.evaluate('a', 'a'.repeat(1000001))).toBe('limit');
  expect(await first).toBe('match');
  expect(await second).toBe('match');
  policy.dispose();
  expect(await policy.evaluate('a', 'a')).toBe('cancelled');
});
test('a blocked factory or silent worker fails closed', async () => {
  for (const workerFactory of [
    () => {
      throw new Error('CSP');
    },
    () => factory(''),
  ]) {
    const blocked = new RegexPolicy({ workerFactory, startupTimeoutMs: 40 });
    try {
      expect(await blocked.evaluate('a', 'a')).toBe('unavailable');
    } finally {
      blocked.dispose();
    }
  }
});
test('rejects invalid limits before accepting work', () => {
  expect(() => new RegexPolicy({ workTimeoutMs: 0 })).toThrow(RangeError);
  expect(() => new RegexPolicy({ queueLimit: Infinity })).toThrow(RangeError);
});

test('report scopes retain current answers and cancel obsolete values', async () => {
  let changes = 0;
  const checks = new RegexChecks(() => changes++, policy);
  expect(checks.run(() => RegexChecks.inspect('(a+)+', 'a'.repeat(40) + '!'))).toBe('pending');
  expect(checks.run(() => RegexChecks.inspect('a+', 'aaa'))).toBe('pending');
  await checks.settled();
  expect(checks.run(() => RegexChecks.inspect('a+', 'aaa'))).toBe('match');
  expect(changes).toBe(1);
  expect(checks.pending).toBe(false);
  checks.run(() => {});
  expect(RegexChecks.inspect('a', 'a')).toBe('pending');
  checks.dispose();
});

test('async report boundaries wait for checks discovered after compilation', async () => {
  const result = await RegexChecks.validate(() => {
    const syntax = RegexChecks.inspect('a+');
    return syntax === 'valid' ? RegexChecks.inspect('a+', 'aaa') : syntax;
  }, policy);
  expect(result).toBe('match');
});
