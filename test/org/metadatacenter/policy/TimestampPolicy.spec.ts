import { TimestampPolicy } from '../../../../src/org/metadatacenter/policy/TimestampPolicy';

/**
 * The format the meta-schemas name, as the Java validator checks it, and the
 * model's stricter reading of a provenance timestamp. A stored timestamp must
 * satisfy both, so each combination is here.
 */
const canonical = (value: string): boolean => {
  try {
    TimestampPolicy.canonical(value);
    return true;
  } catch {
    return false;
  }
};

test.each([
  ['2026-01-15T12:34:56-08:00', true, true],
  ['2026-01-15T12:34:56-0800', true, true],
  ['2026-01-15T12:34:56.123456789Z', true, true],
  ['2026-01-15T12:34:56+08:00:30', true, true],
  ['+12026-01-15T12:34:56Z', true, true],
  ['2026-02-30T00:00:00-08:00', true, false],
  ['2026-01-15T24:00:00Z', true, false],
  ['2026-01-15t12:34:56Z', false, true],
  ['2026-01-15T12:34-08:00', false, true],
  ['2026-01-15T12:34:56-08', false, true],
  ['0000-01-15T12:34:56Z', false, true],
  ['2026-01-15T24:00:00.5Z', false, false],
  ['2026-01-15T12:34:56.1234567890Z', false, false],
  ['2026-01-15T12:34:56+18:01', false, false],
  ['2016-12-31T23:59:60Z', false, false],
  ['2026-01-15', false, false],
])('%s: the format admits it %s, the model reads it %s', (value, format, model) => {
  expect(TimestampPolicy.matchesFormat(value)).toBe(format);
  expect(canonical(value)).toBe(model);
});
