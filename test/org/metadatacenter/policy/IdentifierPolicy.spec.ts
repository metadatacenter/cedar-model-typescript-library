import { IdentifierPolicy } from '../../../../src/org/metadatacenter/policy/IdentifierPolicy';

/** The `uri` format as the server's validator checks it: an IRI reference, relative or absolute, as spelled. */
test.each([
  ['https://example.org/caf\u00e9', true],
  ['https://example.org/Niger\u00a0NER', true],
  ['tmp-123', true],
  ['', true],
  ['https://example.org/a b', false],
  ['https://example.org/%xx', false],
  ['https://example.org/a#b#c', false],
  ['://example.org/a', false],
  ['https://example.org/\ue000', false],
])('%s: the uri format admits it %s', (value, admitted) => {
  expect(IdentifierPolicy.matchesUriFormat(value)).toBe(admitted);
});
