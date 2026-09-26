import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { javaPlainDecimal } from '../../../../../../src/org/metadatacenter/io/writer/yaml/JavaPlainDecimal';
import { SimpleYamlSerializer } from '../../../../../../src/org/metadatacenter/io/writer/yaml/SimpleYamlSerializer';

// These decimal digits come from JDK 17, not Number.toString. Java tests check the same fixture.
const cases: { bits: string; decimal: string }[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../../../../resources/java17-decimal.json'), 'utf8'),
);
function expand(decimal: string): string {
  const [coefficient, exponent = '0'] = decimal.toLowerCase().split('e');
  const [integer, fraction = ''] = coefficient.split('.');
  const digits = integer + fraction;
  const point = integer.length + Number(exponent);
  return point <= 0
    ? '0.' + '0'.repeat(-point) + digits
    : point >= digits.length
      ? digits + '0'.repeat(point - digits.length)
      : digits.slice(0, point) + '.' + digits.slice(point);
}

describe('Java 17 plain decimal spelling', () => {
  test('matches Java boundary/random fixtures, preserves binary values and emits unquoted YAML', () => {
    const bytes = new DataView(new ArrayBuffer(8));
    for (const { bits, decimal } of cases) {
      bytes.setBigUint64(0, BigInt('0x' + bits));
      const positive = bytes.getFloat64(0);
      for (const sign of [1, -1]) {
        const value = positive * sign;
        const expected = (sign < 0 && value !== 0 ? '-' : '') + expand(decimal);
        expect(javaPlainDecimal(value)).toBe(expected);
        const yaml = SimpleYamlSerializer.serialize({ bound: value });
        expect(yaml).toBe('bound: ' + expected + '\n');
        expect(YAML.parse(yaml).bound).toBe(value === 0 ? 0 : value);
      }
    }
  });
  test('rejects nonfinite input to the finite decimal formatter', () => {
    for (const n of [NaN, Infinity, -Infinity]) expect(() => javaPlainDecimal(n)).toThrow(RangeError);
  });
});
