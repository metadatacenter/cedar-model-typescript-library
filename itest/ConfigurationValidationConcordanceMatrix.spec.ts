import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { FieldValuePolicy, JsonSourcePolicy, ValidationField, ValidationPolicy } from '../src';

const bytes = readFileSync(join(__dirname, 'resources/concordance/configuration-validation.json'));
const corpus = JsonSourcePolicy.parse(bytes.toString()) as {
  cases: { id: string; field: ValidationField; codes: string[]; categories: string[]; paths: string[] }[];
};

test('pins configuration facts to the normative Java corpus', () => {
  const lock = JSON.parse(readFileSync(join(__dirname, 'resources/concordance/configuration-validation-lock.json'), 'utf8'));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(corpus.cases).toHaveLength(lock.caseCount);
  expect(lock.javaCommit).toMatch(/^[a-f0-9]{40}$/);
  if (lock.javaWorkingTree) expect(lock.javaSourceSha256).toMatch(/^[a-f0-9]{64}$/);
});

test.each(corpus.cases)('$id', ({ field, codes, categories, paths }) => {
  const findings = FieldValuePolicy.validateConfiguration(field);
  expect(findings.map((f) => f.code).sort()).toEqual([...codes].sort());
  expect(findings.map((f) => f.category).sort()).toEqual([...categories].sort());
  expect(findings.map((f) => f.path).sort()).toEqual([...paths].sort());
  expect(ValidationPolicy.summarize(findings, 'template').canSave).toBe(codes.length === 0);
});
