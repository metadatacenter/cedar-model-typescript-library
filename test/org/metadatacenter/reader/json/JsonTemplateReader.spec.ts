import { JsonTemplateReader } from '../../../../../src';

describe('JSONTemplateReader', () => {
  test('reads empty template as string, should be not null', () => {
    const templateSourceString = '';
    const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(templateSourceString);
    expect(jsonTemplateReaderResult).not.toBeNull();
  });

  test('reads empty template as object, should be not null', () => {
    const templateSourceObject = {};
    const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromObject(templateSourceObject);
    expect(jsonTemplateReaderResult).not.toBeNull();
  });
});
