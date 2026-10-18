import { JsonTemplateReader } from '../../../../../src';

describe('JSONTemplateReader', () => {
  test('empty source is refused without manufacturing an empty template', () => {
    expect(() => JsonTemplateReader.getStrict().readFromString('')).toThrow(SyntaxError);
  });

  test('reads empty template as object, should be not null', () => {
    const templateSourceObject = {};
    const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromObject(templateSourceObject);
    expect(jsonTemplateReaderResult).not.toBeNull();
  });
});
