import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { JsonSourcePolicy, NumericPolicy } from '../src/policy';
import { YamlSourcePolicy } from '../src';
import { SimpleYamlSerializer } from '../src/org/metadatacenter/io/writer/yaml/SimpleYamlSerializer';

const bytes = readFileSync(join(__dirname, 'resources/concordance/source-policy.json'));
const corpus = JSON.parse(bytes.toString()) as { cases: { id: string; format: string; source: string; expected: string | null }[] };
test('pins the normative source corpus to Java', () => {
  const lock = JSON.parse(readFileSync(join(__dirname, 'resources/concordance/source-policy-lock.json'), 'utf8'));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(corpus.cases).toHaveLength(lock.caseCount);
});
test.each(corpus.cases)('$id', ({ format, source, expected }) => {
  const parse = () => (format === 'json' ? JsonSourcePolicy.parse(source) : YamlSourcePolicy.parse(source));
  if (expected === null) expect(parse).toThrow();
  else {
    const object = parse();
    expect(JsonSourcePolicy.stringify(object)).toBe(JsonSourcePolicy.stringify(JsonSourcePolicy.parse(expected)));
    expect(JsonSourcePolicy.stringify(YamlSourcePolicy.parse(SimpleYamlSerializer.serialize(object)))).toBe(
      JsonSourcePolicy.stringify(object),
    );
  }
});
test('preserves prototype-like keys as data, including nested objects', () => {
  for (const obj of [
    JsonSourcePolicy.parse('{"__proto__":{"polluted":true},"constructor":1}'),
    YamlSourcePolicy.parse('__proto__: {polluted: true}\nconstructor: 1'),
  ]) {
    expect(Object.getPrototypeOf(obj)).toBe(Object.prototype);
    expect(Object.hasOwn(obj, '__proto__')).toBe(true);
    expect(JsonSourcePolicy.parse(JsonSourcePolicy.stringify(obj))).toEqual(obj);
  }
});
test('rejects malformed JSON and nonfinite object-API numbers', () => {
  for (const source of ['{"a":01}', '{"a":1,}', '{"a":[1,]}', '{"a":"x}', '{"a":"\\x41"}', '{}x'])
    expect(() => JsonSourcePolicy.parse(source)).toThrow();
  expect(() => JsonSourcePolicy.stringify({ n: Infinity })).toThrow();
});
test('preserves decimals even where Java 17 and ECMAScript double spelling differs', () => {
  for (const text of ['9.999999999999999e22', '0.10000000000000001', '1e-9999']) {
    const output = JsonSourcePolicy.stringify(JsonSourcePolicy.parse('{"n":' + text + '}'));
    expect(NumericPolicy.compare(String(JsonSourcePolicy.parse(output).n), text)).toBe(0);
  }
});
