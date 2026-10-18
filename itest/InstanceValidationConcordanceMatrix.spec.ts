import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { FieldValuePolicy, ValidationField, ValidationPolicy, TemplateValueValidator } from '../src';

const bytes = readFileSync(join(__dirname, 'resources/concordance/instance-validation.json'));
const corpus = JSON.parse(bytes.toString()) as {
  cases: { id: string; field: ValidationField; value: unknown; defaultValue: boolean; codes: string[]; categories: string[] }[];
};
test('pins instance-value facts to the normative Java corpus', () => {
  const lock = JSON.parse(readFileSync(join(__dirname, 'resources/concordance/instance-validation-lock.json'), 'utf8'));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(corpus.cases).toHaveLength(lock.caseCount);
  expect(lock.javaCommit).toMatch(/^[a-f0-9]{40}$/);
  if (lock.javaWorkingTree) expect(lock.javaSourceSha256).toMatch(/^[a-f0-9]{64}$/);
});
test.each(corpus.cases)('$id', ({ field, value, defaultValue, codes, categories }) => {
  const findings = FieldValuePolicy.validate(field, value, '/Answer/@value', defaultValue ? 'template' : 'instance');
  expect(findings.map((f) => f.code).sort()).toEqual([...codes].sort());
  expect(findings.map((f) => f.category).sort()).toEqual([...categories].sort());
  expect(ValidationPolicy.summarize(findings).canSave).toBe(!categories.includes('structural'));
  expect(ValidationPolicy.summarize(findings, 'template').canSave).toBe(codes.length === 0);
});
test('never conflates malformed numeric atoms, omitted slots and unfilled answers', () => {
  const field = { _ui: { inputType: 'numeric' }, _valueConstraints: { numberType: 'xsd:int', requiredValue: true } };
  expect(FieldValuePolicy.validateNode(field, { '@value': '7' }).map((f) => f.code)).toContain('valueType');
  expect(FieldValuePolicy.validateNode(field, { '@value': 'abc', '@type': 'xsd:int' }).map((f) => f.category)).toContain('structural');
  expect(FieldValuePolicy.validateNode(field, { '@value': null }).map((f) => f.code)).toEqual(['required']);
  expect(ValidationPolicy.summarize(FieldValuePolicy.validateNode(field, { '@value': null })).canSave).toBe(true);
});
test('unknown semantic checks are visible and failed defaults are unsaveable', () => {
  const field = { _ui: { inputType: 'ext-orcid' }, _valueConstraints: { defaultValue: 'https://orcid.org/0000-0001-5109-3700' } };
  const report = TemplateValueValidator.validateSource(field);
  expect(report.isValid).toBe(false);
  expect(report.findings).toEqual([expect.objectContaining({ code: 'semanticNotChecked', verificationStatus: 'notChecked' })]);
  const failure = ValidationPolicy.finding('authorityMembership', '/_valueConstraints/defaultValue', 'Identifier not found.', 'failed');
  expect(ValidationPolicy.summarize([failure], 'template').canSave).toBe(false);
  expect(ValidationPolicy.summarize([failure], 'instance').canSave).toBe(true);
});
test('finding pointers preserve slashes, tildes and occurrence indexes', () => {
  expect(ValidationPolicy.pointer(['a/b', 2, '~name', '@value'])).toBe('/a~1b/2/~0name/@value');
});

test('explicitly failed semantic facts block defaults even when classified as verification', () => {
  const fact = {
    code: 'authorityMembership',
    category: 'verification' as const,
    path: '/_valueConstraints/defaultValue',
    message: 'Not found',
    verificationStatus: 'failed' as const,
  };
  expect(ValidationPolicy.summarize([fact], 'template').canSave).toBe(false);
  expect(ValidationPolicy.summarize([fact], 'instance').canSave).toBe(true);
});

test('controlled defaults require a populated identifier while instance labels remain optional', () => {
  const field = { _ui: { inputType: 'controlled-term' }, _valueConstraints: { defaultValue: { termUri: '', 'rdfs:label': 'Label' } } };
  expect(FieldValuePolicy.validateDefault(field).map((f) => f.code)).toEqual(['controlledStructure']);
  expect(FieldValuePolicy.validateNode(field, { '@id': 'https://example.org/term' })).toEqual([]);
  expect(FieldValuePolicy.validateNode(field, { '@id': 'https://example.org/term', 'rdfs:label': 17 }).map((f) => f.category)).toEqual([
    'structural',
  ]);
});

test('empty terminology arrays on a literal field do not change its value shape', () => {
  const field = {
    _ui: { inputType: 'textfield' },
    properties: { '@value': { type: ['string', 'null'] } },
    _valueConstraints: { classes: [] },
  };
  expect(FieldValuePolicy.isControlled(field)).toBe(false);
  expect(FieldValuePolicy.validateNode(field, { '@value': 'text' })).toEqual([]);
});
