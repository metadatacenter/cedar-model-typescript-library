import { CedarReaders } from '../../../../../src';

const MALFORMED = 'type: "template"\n  name: [unclosed\n';
// A syntax failure must reach the caller; manufacturing an empty instance would discard user data.
describe('unparseable YAML remains a source error', () => {
  const readers = CedarReaders.yaml().getStrict();
  test.each([
    readers.getTemplateReader(),
    readers.getTemplateElementReader(),
    readers.getTemplateFieldReader(),
    readers.getTemplateInstanceReader(),
  ])('each artifact reader refuses malformed input', (reader) => {
    expect(() => reader.readFromString(MALFORMED)).toThrow(SyntaxError);
  });
});
