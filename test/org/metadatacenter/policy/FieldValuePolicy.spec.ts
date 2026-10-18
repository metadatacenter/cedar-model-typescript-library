import { Worker } from 'node:worker_threads';
import {
  ExactDecimal,
  RegexChecks,
  RegexPolicy,
  RegexWorker,
  REGEX_WORKER_SOURCE,
  ValidationFinding,
  ValidationPolicy,
} from '../../../../src/policy';
import { FieldValuePolicy, ValidationField } from '../../../../src/org/metadatacenter/policy/FieldValuePolicy';

const text: ValidationField = { _ui: { inputType: 'textfield' } };
const numeric: ValidationField = {
  _ui: { inputType: 'numeric' },
  _valueConstraints: { numberType: 'xsd:int' },
  required: ['@value', '@type'],
};
const iri: ValidationField = { _ui: { inputType: 'controlled-term' }, properties: { '@id': { type: 'string' } } };
const codes = (findings: ValidationFinding[]) => findings.map((finding) => finding.code);

// Run the same isolated expression worker used in the browser; no synchronous regex fallback.
function regexWorker(): RegexWorker {
  const worker = new Worker(
    `const { parentPort } = require('node:worker_threads');
     globalThis.postMessage = (data) => parentPort.postMessage(data);
     parentPort.on('message', (data) => globalThis.onmessage({data}));\n${REGEX_WORKER_SOURCE}`,
    { eval: true },
  );
  const adapter: RegexWorker = {
    onmessage: null,
    onerror: null,
    postMessage: (value) => worker.postMessage(value),
    terminate: () => { void worker.terminate(); },
  };
  worker.on('message', (data) => adapter.onmessage?.({ data }));
  worker.on('error', () => adapter.onerror?.());
  return adapter;
}

describe('raw field-value boundaries', () => {
  test('absent optional metadata does not invent terminology or constraints', () => {
    expect(FieldValuePolicy.isControlled({})).toBe(false);
    expect(FieldValuePolicy.isIri({})).toBe(false);
    expect(FieldValuePolicy.validateConfiguration({})).toEqual([]);
    expect(FieldValuePolicy.validate({}, 'ordinary text')).toEqual([]);
    expect(FieldValuePolicy.validateDefault({})).toEqual([]);
    expect(() => FieldValuePolicy.assertConsistent({})).not.toThrow();
    expect(FieldValuePolicy.validateNode({}, { '@value': 'ordinary text' })).toEqual([]);
  });

  test.each([17, true, {}, ['answer']])('rejects a populated non-string scalar %j', (value) => {
    const findings = FieldValuePolicy.validate(text, value, '/Answer/@value');
    expect(codes(findings)).toEqual(['valueShape']);
    expect(ValidationPolicy.summarize(findings).canSave).toBe(false);
  });

  test.each([null, undefined, '', 7, true, []])('rejects a missing or non-object field slot %j', (node) => {
    const findings = FieldValuePolicy.validateNode(text, node, '/Answer');
    expect(findings).toEqual([expect.objectContaining({ code: 'valueShape', category: 'structural', path: '/Answer' })]);
  });

  test('distinguishes missing required properties from an unanswered typed literal', () => {
    expect(codes(FieldValuePolicy.validateNode(numeric, { '@value': null }))).toEqual(['missingProperty']);
    const required = { ...numeric, _valueConstraints: { numberType: 'xsd:int', requiredValue: true } };
    const findings = FieldValuePolicy.validateNode(required, { '@value': null, '@type': 'xsd:int' }, '/Amount');
    expect(findings).toEqual([expect.objectContaining({ code: 'required', category: 'completeness', path: '/Amount/@value' })]);
    expect(ValidationPolicy.summarize(findings).canSave).toBe(true);
    expect(codes(FieldValuePolicy.validateNode(text, {}, '/Text'))).toEqual(['missingProperty']);
    expect(codes(FieldValuePolicy.validateNode(text, { 'rdfs:label': 'Label only' }))).toEqual(['valueShape']);
  });

  test('keeps a literal field distinct from an IRI field', () => {
    expect(codes(FieldValuePolicy.validateNode(text, { '@id': 'urn:term', '@value': 'text' }))).toEqual(['valueShape']);
    expect(codes(FieldValuePolicy.validateNode(iri, { '@id': 'urn:term', '@value': 'text' }))).toEqual(['valueShape']);
    expect(codes(FieldValuePolicy.validateNode(iri, { 'rdfs:label': 'Unidentified term' }))).toEqual(['controlledStructure']);
    expect(FieldValuePolicy.validateNode(iri, { '@id': 'urn:term', '@value': null })).toEqual([]);
  });

  test.each([{}, { '@value': null }])('recognizes an unanswered IRI slot %j without claiming an invalid identifier', (node) => {
    expect(FieldValuePolicy.validateNode(iri, node)).toEqual([]);
    const required = { ...iri, _valueConstraints: { requiredValue: true } };
    const findings = FieldValuePolicy.validateNode(required, node, '/Term');
    expect(codes(findings)).toEqual(['required']);
    expect(ValidationPolicy.summarize(findings)).toMatchObject({ canSave: true, isValid: false });
  });

  test.each([null, '', 7])('refuses explicitly malformed IRI identifiers %j', (id) => {
    expect(codes(FieldValuePolicy.validateNode(iri, { '@id': id }))).toEqual(['iriMalformed']);
  });

  test.each(['rdfs:label', 'skos:prefLabel', 'skos:notation', '@language'])('validates optional %s metadata when present', (key) => {
    expect(codes(FieldValuePolicy.validateNode(iri, { '@id': 'urn:term', [key]: ['not a scalar'] }))).toEqual(['valueShape']);
    expect(FieldValuePolicy.validateNode(iri, { '@id': 'urn:term', [key]: null })).toEqual([]);
  });

  test('recognizes full datatype IRIs without accepting an unrelated populated datatype', () => {
    expect(FieldValuePolicy.validateNode(numeric, { '@type': 'http://www.w3.org/2001/XMLSchema#int', '@value': '12' })).toEqual([]);
    expect(codes(FieldValuePolicy.validateNode(numeric, { '@type': ['xsd:int'], '@value': '12' }))).toEqual(['valueType']);
  });
});

describe('configuration and defaults', () => {
  test('reports malformed and inconsistent configuration at the offending property', () => {
    const findings = FieldValuePolicy.validateConfiguration({ _valueConstraints: { minLength: 5, maxLength: 2, regex: null } }, '/Field');
    expect(findings).toEqual([
      expect.objectContaining({ code: 'templateConstraint', path: '/Field/_valueConstraints/maxLength' }),
      expect.objectContaining({ code: 'templateConstraint', path: '/Field/_valueConstraints/regex' }),
    ]);
    expect(FieldValuePolicy.validateConfiguration({ _valueConstraints: { regex: '' } })).toEqual([]);
    expect(codes(FieldValuePolicy.validateConfiguration({ _valueConstraints: { maxLength: 2147483648 } }))).toEqual(['templateConstraint']);
  });

  test('unknown numeric datatypes fail even if their bounds would otherwise be ordinary', () => {
    const field = { _ui: { inputType: 'numeric' }, _valueConstraints: { numberType: 'xsd:not-a-number', minValue: 0, maxValue: 1 } };
    expect(codes(FieldValuePolicy.validateConfiguration(field))).toEqual(['templateConstraint']);
    expect(codes(FieldValuePolicy.validate(field, '1'))).toEqual(['numberType']);
    expect(() => FieldValuePolicy.assertConsistent(field)).toThrow();
  });

  test('uses exact decimal bounds instead of rounding neighboring large integers together', () => {
    const field = {
      _ui: { inputType: 'numeric' },
      _valueConstraints: {
        numberType: 'xsd:long',
        minValue: ExactDecimal.forValue('9007199254740992'),
        maxValue: ExactDecimal.forValue('9007199254740993'),
      },
    };
    expect(FieldValuePolicy.validateConfiguration(field)).toEqual([]);
    expect(FieldValuePolicy.validate(field, '9007199254740993')).toEqual([]);
    expect(codes(FieldValuePolicy.validate(field, '9007199254740994'))).toEqual(['maxValue']);
  });

  test('allows null builder optionals while rejecting an explicitly malformed raw definition', () => {
    const field = { ...text, _valueConstraints: { minLength: null, defaultValue: null } };
    expect(codes(FieldValuePolicy.validateConfiguration(field))).toEqual(['templateConstraint']);
    expect(() => FieldValuePolicy.assertConsistent(field)).not.toThrow();
    expect(() => FieldValuePolicy.assertConsistent({ ...text, _valueConstraints: { maxLength: 2, defaultValue: 'long' } })).toThrow();
  });

  test.each([
    '',
    'urn:term',
    { termUri: null, 'rdfs:label': 'Label' },
    { termUri: '', 'rdfs:label': 'Label' },
    { termUri: 'urn:term' },
    { termUri: 'urn:term', 'rdfs:label': '' },
  ])('requires both identifier and label in a controlled default %j', (defaultValue) => {
    expect(codes(FieldValuePolicy.validateDefault({ ...iri, _valueConstraints: { defaultValue } }))).toEqual(['controlledStructure']);
  });

  test('validates the identifier in a complete controlled default', () => {
    const defaultValue = { termUri: 'urn:term', 'rdfs:label': 'Label' };
    expect(FieldValuePolicy.validateDefault({ ...iri, _valueConstraints: { defaultValue } })).toEqual([]);
    const findings = FieldValuePolicy.validateDefault({ ...iri, _valueConstraints: { defaultValue: { ...defaultValue, termUri: 'relative/path' } } }, '/Field');
    expect(findings).toEqual([expect.objectContaining({ code: 'iriMalformed', path: '/Field/_valueConstraints/defaultValue/termUri' })]);
  });
});

describe('pattern verification remains distinct from value quality', () => {
  const field = { ...text, _valueConstraints: { regex: '[A-Z]+' } };

  test('an unperformed pattern check is explicitly pending', () => {
    const findings = FieldValuePolicy.validate(field, 'lowercase');
    expect(findings).toEqual([expect.objectContaining({ code: 'regexPending', verificationStatus: 'notChecked' })]);
    expect(ValidationPolicy.summarize(findings)).toMatchObject({ canSave: true, isValid: false });
  });

  test('compilation, matching and mismatching have different facts at a settled boundary', async () => {
    const policy = new RegexPolicy({ workerFactory: regexWorker });
    const findings = await RegexChecks.validate(() => ({
      syntax: FieldValuePolicy.validateConfiguration(field),
      match: FieldValuePolicy.validate(field, 'ABC'),
      mismatch: FieldValuePolicy.validate(field, 'lowercase'),
      invalid: FieldValuePolicy.validateConfiguration({ ...text, _valueConstraints: { regex: '[' } }),
      invalidValue: FieldValuePolicy.validate({ ...text, _valueConstraints: { regex: '[' } }, 'text'),
    }), policy);
    expect(findings.syntax).toEqual([]);
    expect(findings.match).toEqual([]);
    expect(codes(findings.mismatch)).toEqual(['regex']);
    expect(codes(findings.invalid)).toEqual(['templateConstraint']);
    expect(findings.invalidValue).toEqual([]); // Syntax is reported once at the definition, not as a bad answer.
    expect(ValidationPolicy.summarize(findings.mismatch).canSave).toBe(true);
    expect(ValidationPolicy.summarize(findings.mismatch, 'template').canSave).toBe(false);
  });

  test('unavailable execution neither validates the answer nor makes it malformed', async () => {
    const policy = new RegexPolicy({ workerFactory: () => { throw new Error('Worker blocked'); } });
    const findings = await RegexChecks.validate(() => FieldValuePolicy.validate(field, 'lowercase'), policy);
    expect(findings).toEqual([expect.objectContaining({ code: 'regexEvaluation', category: 'verification', verificationStatus: 'unavailable' })]);
    expect(ValidationPolicy.summarize(findings)).toMatchObject({ canSave: true, isValid: false });
  });
});

describe('temporal calendar and declared precision boundaries', () => {
  test.each<[string, string | undefined, string, string[]]>([
    ['xsd:date', undefined, '2000-02-29', []],
    ['xsd:date', undefined, '1900-02-29', ['temporalCalendar']],
    ['xsd:time', undefined, '12:30', []],
    ['xsd:dateTime', 'day', '2024-02-29T00:00', []],
    ['xsd:dateTime', 'day', '2024-02-29T00:00:00', []],
    ['xsd:dateTime', 'day', '2024-02-29T01:00', ['temporalGranularity']],
    ['xsd:time', 'hour', '12:00:01', ['temporalGranularity']],
    ['xsd:time', 'hour', '12:00:00.1', ['temporalGranularity']],
    ['xsd:time', 'second', '12:30', ['temporalGranularity']],
    ['xsd:time', 'minute', '12:30:01', ['temporalGranularity']],
    ['xsd:time', 'minute', '12:30:00.1', ['temporalGranularity']],
    ['xsd:not-a-date', undefined, '2024-01-01', ['temporalType']],
  ])('%s at %s granularity: %s', (temporalType, temporalGranularity, value, expected) => {
    const field = { _ui: { inputType: 'temporal', temporalGranularity }, _valueConstraints: { temporalType } } as ValidationField;
    const findings = FieldValuePolicy.validate(field, value);
    expect(codes(findings)).toEqual(expected);
    expect(ValidationPolicy.summarize(findings).canSave).toBe(!expected.includes('temporalCalendar') && !expected.includes('temporalType'));
  });
});
