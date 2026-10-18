import { DisplayText, IdentifierPolicy, TextPolicy } from '../src/policy';

test('distinguishes field spelling from identifier spelling and rejects missing URI parts', () => {
  expect(IdentifierPolicy.isValidFieldValue('urn:x\u00a0')).toBe(true);
  expect(IdentifierPolicy.isValid('urn:x\u00a0')).toBe(false);
  for (const invalid of ['urn:', 'http://', 'urn:#x', 'urn:x\ud800']) {
    expect(IdentifierPolicy.isValidFieldValue(invalid)).toBe(false);
    expect(IdentifierPolicy.isValid(invalid)).toBe(false);
  }
  expect(IdentifierPolicy.isValidFieldValue(null as never)).toBe(false);
  expect(IdentifierPolicy.isValidAuthoringIri('https:example.org')).toBe(false);
  expect(IdentifierPolicy.isValidAuthoringIri('https://example.org/x\u00a0', true)).toBe(true);
  expect(IdentifierPolicy.isValidAuthoringIri('urn:x\ufeff')).toBe(true);
  expect(IdentifierPolicy.isValidAuthoringIri('https://[broken]/')).toBe(false);
  expect(IdentifierPolicy.isValidAuthoringIri('relative')).toBe(false);
  expect(IdentifierPolicy.isValidAuthoringIri('urn:x\ud800')).toBe(false);
  expect(TextPolicy.trimInputPadding(' \turn:x\ufeff\n ')).toBe('urn:x\ufeff');
  expect(TextPolicy.trimInputPadding('\u00a0urn:x\u00a0')).toBe('\u00a0urn:x\u00a0');
});

test.each([
  ['İx', 'x', ['İ', 'x', '']],
  ['aİx', 'i', ['a', 'İ', 'x']],
  ['aéx', 'e\u0301', ['a', 'é', 'x']],
  ['ae\u0301x', 'É', ['a', 'e\u0301', 'x']],
  ['a👩‍💻x', '💻', ['a', '👩‍💻', 'x']],
  ['abc', '', ['abc', '', '']],
  ['abc', 'z', ['abc', '', '']],
])('finds %s / %s without changing the original', (value, query, expected) => {
  const result = DisplayText.splitMatch(value as string, query as string);
  expect(result).toEqual(expected);
  expect(result.join('')).toBe(value);
});

test('elides at grapheme boundaries and preserves the ordinary ASCII layout', () => {
  expect(DisplayText.elide('abcdefghij', 7, 2)).toBe('abcd…ij');
  for (const cluster of ['😀', 'e\u0301', '👩‍💻', '🇺🇸']) {
    expect(DisplayText.elide(cluster.repeat(10), 7, 2)).toBe(cluster.repeat(4) + '…' + cluster.repeat(2));
  }
  expect(DisplayText.elide('short')).toBe('short');
  expect(DisplayText.elide('abcdefgh', 3, 0)).toBe('ab…');
  expect(DisplayText.elide('abcdefgh', 1, 8)).toBe('…');
});

test('search derives keys and keeps canonical equivalents distinct in the input', () => {
  expect(DisplayText.searchKey('İx')).toBe('i\u0307x');
  expect(DisplayText.searchKey('é')).toBe(DisplayText.searchKey('e\u0301'));
  expect(DisplayText.searchKey('I')).toBe('i');
});
