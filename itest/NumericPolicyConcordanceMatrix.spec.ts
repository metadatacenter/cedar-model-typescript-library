import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { ExactDecimal, NumericPolicy, JsonSourcePolicy } from '../src/policy';
const bytes = readFileSync(join(__dirname, 'resources/concordance/numeric-policy.json'));
const corpus = JSON.parse(bytes.toString()) as {
  cases: { value: string; valid: boolean }[];
  comparisons: { left: string; right: string; order: number }[];
};
test('pins the normative numeric corpus to Java', () => {
  const lock = JSON.parse(readFileSync(join(__dirname, 'resources/concordance/numeric-policy-lock.json'), 'utf8'));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(corpus.cases).toHaveLength(lock.caseCount);
});
test.each(corpus.cases)('decimal $value valid=$valid', ({ value, valid }) => {
  if (!valid) expect(() => NumericPolicy.value(value)).toThrow();
  else {
    const number = NumericPolicy.value(value);
    expect(NumericPolicy.compare(value, number)).toBe(0);
    const restored = JsonSourcePolicy.parse(JsonSourcePolicy.stringify({ number })).number;
    expect(NumericPolicy.compare(String(restored), value)).toBe(0);
  }
});
test.each(corpus.comparisons)('$left versus $right', ({ left, right, order }) => {
  expect(NumericPolicy.compare(left, right)).toBe(order);
  expect(NumericPolicy.compare(right, left)).toBe(order === 0 ? 0 : -order);
});
test('canonical values at Java exponent limits remain parseable without exponent expansion', () => {
  for (const value of ['10e2147483647', '123.45e2147483647', '1e-2147483647'])
    expect(NumericPolicy.compare(NumericPolicy.value(value), value)).toBe(0);
});
test('exact values refuse lossy implicit coercion', () => {
  expect(() => Number(ExactDecimal.forValue('9007199254740993'))).toThrow();
  expect(NumericPolicy.isInteger('1.000')).toBe(true);
  expect(NumericPolicy.fractionalDigits('0.00100')).toBe(3);
});

test('model readers and writers preserve exact bounds and defaults across JSON and YAML', () => {
  const { CedarBuilders, CedarReaders, CedarWriters, NumberType } = require('../src');
  const field = CedarBuilders.numericFieldBuilder()
    .withSchemaName('Exact bounds')
    .withNumberType(NumberType.DECIMAL)
    .withMinValue('1.00000000000000001')
    .withMaxValue('1.00000000000000003')
    .withDefaultValue('1.00000000000000002')
    .build();
  for (const format of ['json', 'yaml']) {
    const writers = CedarWriters[format]().getStrict();
    const writer = writers.getFieldWriterForField(field);
    const render = (item: unknown) => (format === 'json' ? writer.getAsJsonString(item) : writer.getAsYamlString(item));
    const source = render(field);
    const restored = CedarReaders[format]().getStrict().getTemplateFieldReader().readFromString(source).field;
    expect(NumericPolicy.compare(restored.valueConstraints.minValue, '1.00000000000000001')).toBe(0);
    expect(NumericPolicy.compare(restored.valueConstraints.maxValue, '1.00000000000000003')).toBe(0);
    expect(NumericPolicy.compare(restored.valueConstraints.defaultValue, '1.00000000000000002')).toBe(0);
    expect(render(restored)).toBe(source);
  }
  const long = CedarBuilders.numericFieldBuilder()
    .withSchemaName('Exact long')
    .withNumberType(NumberType.LONG)
    .withDefaultValue('9223372036854775807')
    .build();
  const output = CedarWriters.json().getStrict().getFieldWriterForField(long).getAsJsonString(long);
  expect(JSON.parse(output)._valueConstraints.defaultValue).toBe('9223372036854775807');
});
