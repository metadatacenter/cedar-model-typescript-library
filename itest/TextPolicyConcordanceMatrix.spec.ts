import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { TextPolicy, IdentifierPolicy } from '../src/policy';

const corpus = JSON.parse(readFileSync(join(__dirname, 'resources/concordance/text-policy.json'), 'utf8')) as {
  cases: { id: string; value: string; blank: boolean; codePointLength: number; identifier: boolean; fieldIri: boolean }[];
};

test('pins the shared normative corpus to its Java source commit', () => {
  const bytes = readFileSync(join(__dirname, 'resources/concordance/text-policy.json'));
  const lock = JSON.parse(readFileSync(join(__dirname, 'resources/concordance/text-policy-lock.json'), 'utf8'));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(corpus.cases).toHaveLength(lock.caseCount);
  expect(lock.javaCommit).toMatch(/^[a-f0-9]{40}$/);
});

test.each(corpus.cases)('$id follows the normative contract without changing spelling', (row) => {
  expect(TextPolicy.isBlank(row.value)).toBe(row.blank);
  expect(TextPolicy.codePointLength(row.value)).toBe(row.codePointLength);
  expect(IdentifierPolicy.isValid(row.value)).toBe(row.identifier);
  const check = () => IdentifierPolicy.assertFieldIri(row.value, 'value');
  if (row.fieldIri) expect(check).not.toThrow();
  else expect(check).toThrow();
});

test('nonblank text stays nonblank when surrounded by any pinned whitespace', () => {
  for (let cp = 0; cp <= 0x10ffff; cp++) {
    if (!TextPolicy.isBlankCodePoint(cp)) continue;
    const blank = String.fromCodePoint(cp);
    expect(TextPolicy.isBlank(blank.repeat(3))).toBe(true);
    expect(TextPolicy.isBlank(`${blank}é${blank}`)).toBe(false);
  }
});
