import { PropertyIri } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/PropertyIri';

// A property IRI minted from a field name has to come out the same here as in the Java library, whose
// `URLEncoder.encode(name, UTF_8)` produced these. The two disagreed over five characters — `!`, `'`,
// `(`, `)` and `~`, which Java escapes and `encodeURIComponent` does not — so the same field got
// `Dose+(mg)` from one library and `Dose+%28mg%29` from the other.
//
// The table is what Java answers, character for character. A change to either encoder breaks it.

const NAMESPACE = 'https://schema.metadatacenter.org/properties/';

const asJavaEncodesIt: Array<[string, string]> = [
  ['Study Name', 'Study+Name'],
  ['Dose (mg)', 'Dose+%28mg%29'],
  ["Patient's age", 'Patient%27s+age'],
  ['A~B', 'A%7EB'],
  ['E!F', 'E%21F'],
  ['C*D', 'C*D'],
  ['50% ± 3', '50%25+%C2%B1+3'],
  ['a/b', 'a%2Fb'],
  ['a+b', 'a%2Bb'],
  ['x,y', 'x%2Cy'],
  ['a#b', 'a%23b'],
  ['a?b', 'a%3Fb'],
  ['a&b', 'a%26b'],
  ['a=b', 'a%3Db'],
  ['a:b', 'a%3Ab'],
  ['Ω αβγ', '%CE%A9+%CE%B1%CE%B2%CE%B3'],
  ['中文', '%E4%B8%AD%E6%96%87'],
  ['emoji 😀', 'emoji+%F0%9F%98%80'],
  ['a.b-c_d', 'a.b-c_d'],
  ['a\tb', 'a%09b'],
  ['a\nb', 'a%0Ab'],
];

describe('a property IRI minted from a name', () => {
  test.each(asJavaEncodesIt)('%s encodes as the Java library encodes it', (name: string, encoded: string) => {
    expect(PropertyIri.forName(name)).toBe(NAMESPACE + encoded);
  });

  test('the five characters the two libraries used to disagree over are escaped', () => {
    expect(PropertyIri.forName("!'()~")).toBe(`${NAMESPACE}%21%27%28%29%7E`);
  });

  test('an identifier supplied by the caller is used as it stands', () => {
    expect(PropertyIri.forId('c651f360-612c-4664-9d11-175819245c8b')).toBe(`${NAMESPACE}c651f360-612c-4664-9d11-175819245c8b`);
  });

  test('the namespace is the one every CEDAR property IRI lives in', () => {
    expect(PropertyIri.namespace).toBe(NAMESPACE);
  });
});
