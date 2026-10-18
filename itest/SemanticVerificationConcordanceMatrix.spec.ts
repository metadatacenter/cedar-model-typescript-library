import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { ValidationPolicy, VerificationStatus } from '../src/policy';

const bytes = readFileSync(join(__dirname, 'resources/concordance/semantic-verification.json'));
const corpus = JSON.parse(bytes.toString()) as {
  cases: {
    id: string;
    controlled: boolean;
    status: string;
    code: string;
    accepted: boolean;
    category: string;
    instanceCanSave: boolean;
    templateCanSave: boolean;
    isValid: boolean;
  }[];
};

test('pins semantic response and save policies to the normative Java corpus', () => {
  const lock = JSON.parse(readFileSync(join(__dirname, 'resources/concordance/semantic-verification-lock.json'), 'utf8'));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(corpus.cases).toHaveLength(lock.caseCount);
  expect(lock.javaCommit).toMatch(/^[a-f0-9]{40}$/);
  if (lock.javaWorkingTree) expect(lock.javaSourceSha256).toMatch(/^[a-f0-9]{64}$/);
});

test.each(corpus.cases)('$id', (row) => {
  const accepted = ValidationPolicy.acceptsSemanticResult(row.controlled, row.status, row.code);
  expect(accepted).toBe(row.accepted);
  const finding = ValidationPolicy.finding(
    accepted ? row.code : 'semanticUnavailable',
    '/answer/@id',
    'Semantic evidence',
    accepted ? (row.status as VerificationStatus) : 'unavailable',
  );
  expect(finding.category).toBe(row.category);
  expect(ValidationPolicy.summarize([finding])).toMatchObject({
    canSave: row.instanceCanSave,
    isValid: row.isValid,
    structurallyValid: true,
  });
  expect(ValidationPolicy.summarize([finding], 'template')).toMatchObject({
    canSave: row.templateCanSave,
    isValid: row.isValid,
    structurallyValid: true,
  });
});

test.each([null, undefined, 42, {}, ['passed']])('rejects a non-string semantic status or code: %p', (value) => {
  expect(ValidationPolicy.acceptsSemanticResult(true, value, 'controlledTermVerified')).toBe(false);
  expect(ValidationPolicy.acceptsSemanticResult(true, 'passed', value)).toBe(false);
});
