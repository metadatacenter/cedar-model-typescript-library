import { JSONTemplateReader } from '../../../../../src';

describe('JSONTemplateReader', () => {
  test('reads empty template as string, should be not null', () => {
    const templateSourceString = '';
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(templateSourceString);
    expect(jsonTemplateReaderResult).not.toBeNull();
  });

  test('reads empty template as object, should be not null', () => {
    const templateSourceObject = {};
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromObject(templateSourceObject);
    expect(jsonTemplateReaderResult).not.toBeNull();
  });
});
