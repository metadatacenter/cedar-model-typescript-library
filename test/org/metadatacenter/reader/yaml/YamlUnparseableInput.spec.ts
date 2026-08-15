import { CedarReaders } from '../../../../../src';

/**
 * What each YAML reader does with a document that is not YAML at all.
 *
 * `YAML.parse` throws on malformed input, and every reader catches that and carries on with an empty
 * document rather than letting the parser's own error escape. What happens next is the reader's
 * ordinary judgement of an empty document, which differs by artifact kind and is worth stating: a
 * schema artifact is refused for the model version it does not carry, a field for the type it does not
 * name, and an instance — which requires neither — reads as an empty instance.
 *
 * The point is that the failure is the library's own, phrased in the model's terms. A parser stack
 * trace reaching a caller would say only that column 3 surprised it.
 */
const MALFORMED = 'type: "template"\n  name: [unclosed\n';

describe('a document that is not YAML', () => {
  test('a template is refused for the model version an empty document does not carry', () => {
    expect(() => CedarReaders.yaml().getStrict().getTemplateReader().readFromString(MALFORMED)).toThrow(/modelVersion/);
  });

  test('an element likewise', () => {
    expect(() => CedarReaders.yaml().getStrict().getTemplateElementReader().readFromString(MALFORMED)).toThrow(/modelVersion/);
  });

  test('a field is refused for the type it does not name', () => {
    expect(() => CedarReaders.yaml().getStrict().getTemplateFieldReader().readFromString(MALFORMED)).toThrow(/Unknown field type/);
  });

  test('an instance reads as an empty instance, since it requires neither', () => {
    const result = CedarReaders.yaml().getStrict().getTemplateInstanceReader().readFromString(MALFORMED);

    expect(result.parsingResult.wasSuccessful()).toBe(true);
    expect(result.instance.schema_name).toBeNull();
  });
});
