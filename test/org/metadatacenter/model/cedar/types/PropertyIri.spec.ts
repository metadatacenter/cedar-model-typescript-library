import { PropertyIri } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/PropertyIri';

// A property IRI minted from a field name has to come out the same here as in the Java library. The
// name becomes a path segment, so it is percent-encoded: a space is `%20`, and the characters a
// segment takes literally are left alone. Both libraries used to reach for form encoding, which is
// meant for a query string and writes a space as `+` — a literal plus in a path, so the IRI did not
// decode back to the name — and they disagreed over `!`, `'`, `(`, `)` and `~` while doing it.
//
// The table is what both libraries answer, character for character. A change to either breaks it.

const NAMESPACE = 'https://schema.metadatacenter.org/properties/';

const bothLibrariesEncodeAs: Array<[string, string]> = [
  ['Study Name', 'Study%20Name'],
  ['Dose (mg)', 'Dose%20(mg)'],
  ["Patient's age", "Patient's%20age"],
  ['A~B', 'A~B'],
  ['E!F', 'E!F'],
  ['C*D', 'C*D'],
  ['50% ± 3', '50%25%20%C2%B1%203'],
  ['a/b', 'a%2Fb'],
  ['a+b', 'a%2Bb'],
  ['x,y', 'x%2Cy'],
  ['a#b', 'a%23b'],
  ['a?b', 'a%3Fb'],
  ['a&b', 'a%26b'],
  ['a=b', 'a%3Db'],
  ['a:b', 'a%3Ab'],
  ['Ω αβγ', '%CE%A9%20%CE%B1%CE%B2%CE%B3'],
  ['中文', '%E4%B8%AD%E6%96%87'],
  ['emoji 😀', 'emoji%20%F0%9F%98%80'],
  ['a.b-c_d', 'a.b-c_d'],
  ['a\tb', 'a%09b'],
  ['a\nb', 'a%0Ab'],
  ["!'()~", "!'()~"],
];

describe('a property IRI minted from a name', () => {
  test.each(bothLibrariesEncodeAs)('%s encodes as both libraries encode it', (name: string, encoded: string) => {
    expect(PropertyIri.forName(name)).toBe(NAMESPACE + encoded);
  });

  test('the characters a path segment takes literally are left alone', () => {
    expect(PropertyIri.forName("!'()~*")).toBe(`${NAMESPACE}!'()~*`);
  });

  test('a space is %20, not the + form encoding would write', () => {
    expect(PropertyIri.forName('Study Name')).toBe(`${NAMESPACE}Study%20Name`);
    expect(PropertyIri.forName('a+b')).toBe(`${NAMESPACE}a%2Bb`);
  });

  test('an identifier supplied by the caller is used as it stands', () => {
    expect(PropertyIri.forId('c651f360-612c-4664-9d11-175819245c8b')).toBe(`${NAMESPACE}c651f360-612c-4664-9d11-175819245c8b`);
  });

  test('the namespace is the one every CEDAR property IRI lives in', () => {
    expect(PropertyIri.namespace).toBe(NAMESPACE);
  });
});
