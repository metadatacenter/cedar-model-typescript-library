import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { TimestampPolicy } from '../src/policy';
import { IsoDate } from '../src';

const bytes = readFileSync(join(__dirname, 'resources/concordance/timestamp-policy.json'));
const corpus = JSON.parse(bytes.toString()) as { cases: { id: string; value: string; canonical: string | null }[] };

test('pins the normative timestamp corpus to its committed Java source', () => {
  const lock = JSON.parse(readFileSync(join(__dirname, 'resources/concordance/timestamp-policy-lock.json'), 'utf8'));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(corpus.cases).toHaveLength(lock.caseCount);
  expect(lock.javaCommit).toMatch(/^[a-f0-9]{40}$/);
});

test.each(corpus.cases)('$id preserves the calendar, precision and offset', ({ value, canonical }) => {
  if (canonical === null) expect(() => TimestampPolicy.canonical(value)).toThrow();
  else {
    expect(TimestampPolicy.canonical(value)).toBe(canonical);
    expect(IsoDate.forValue(value).getValue()).toBe(canonical);
    expect(IsoDate.forValue(canonical).getValue()).toBe(canonical);
  }
});
