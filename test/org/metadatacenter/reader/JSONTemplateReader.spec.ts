import { JSONTemplateReader } from '../../../../src/org/metadatacenter/reader/JSONTemplateReader';

describe('JSONTemplateReader', () => {
  test('reads empty template as string, should be not null', () => {
    const templateSourceString = '';
    const jsonTemplateReaderResult = JSONTemplateReader.readFromString(templateSourceString);
    expect(jsonTemplateReaderResult).not.toBeNull();
  });

  test('reads empty template as object, should be not null', () => {
    const templateSourceObject = {};
    const jsonTemplateReaderResult = JSONTemplateReader.readFromObject(templateSourceObject);
    expect(jsonTemplateReaderResult).not.toBeNull();
  });
});
