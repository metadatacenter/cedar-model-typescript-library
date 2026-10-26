import { JsonTemplateReader } from '../../../../../src';

describe('JSONTemplateReader', () => {
  test('empty source is refused without manufacturing an empty template', () => {
    expect(() => JsonTemplateReader.getStrict().readFromString('')).toThrow(SyntaxError);
  });

  // An empty object declares nothing, and Java refuses it. The compatibility reader, which CEE opens a
  // host's template with, still reads one, as it reads any template that leaves its declarations out.
  test('an empty object is refused by the strict reader and read by the compatibility reader', () => {
    expect(() => JsonTemplateReader.getStrict().readFromObject({})).toThrow('A schema artifact must declare a JSON-LD @type');
    expect(JsonTemplateReader.getFebruary2024().readFromObject({})).not.toBeNull();
  });
});
