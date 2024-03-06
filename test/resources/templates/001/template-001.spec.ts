import { JSONTemplateReader } from '../../../../src/org/metadatacenter/reader/JSONTemplateReader';
import { TestUtil } from '../../../TestUtil';

describe('JSONTemplateReader - template-001', () => {
  test('reads very simple template as string, before save', () => {
    const templateSource = TestUtil.readTestResourceAsString('templates/001', 'template-001.json');
    const jsonTemplateReaderResult = JSONTemplateReader.readFromString(templateSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);
  });

  test('reads very simple template as string, before save', () => {
    const templateSource = TestUtil.readTestResourceAsString('templates/001', 'template-001.json');
    const templateObject = JSON.parse(templateSource);
    const jsonTemplateReaderResult = JSONTemplateReader.readFromObject(templateObject);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);
  });
});
