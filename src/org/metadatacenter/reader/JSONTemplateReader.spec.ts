import { JSONTemplateReader } from './JSONTemplateReader';

describe('JSONTemplateReader', () => {
  xtest('reads empty template as string, should be not null', () => {
    const templateSourceString = '';
    const jsonTemplateReaderResult = JSONTemplateReader.readFromString(templateSourceString);
    expect(jsonTemplateReaderResult).not.toBeNull();
  });

  xtest('reads empty template as object, should be not null', () => {
    const templateSourceObject = {};
    const jsonTemplateReaderResult = JSONTemplateReader.readFromObject(templateSourceObject);
    expect(jsonTemplateReaderResult).not.toBeNull();
  });

  xtest('reads very simple template as string, before save', () => {
    const jsonTemplateReaderResult = JSONTemplateReader.readFromString((global as any).templateSource001);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);
  });

  xtest('reads very simple template as string, before save', () => {
    const jsonTemplateReaderResult = JSONTemplateReader.readFromObject((global as any).templateObject001);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);
  });

  xtest('reads very simple template as object, after save', () => {
    const jsonTemplateReaderResult = JSONTemplateReader.readFromObject((global as any).templateObject002);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);
  });

  test('reads very simple template as object, with various mismatches', () => {
    const jsonTemplateReaderResult = JSONTemplateReader.readFromObject((global as any).templateObject003);
    console.log(jsonTemplateReaderResult.template);
    console.log(JSON.stringify(jsonTemplateReaderResult.template, null, 2));
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(false);
  });

  xtest('reads template with static fields', () => {
    const jsonTemplateReaderResult = JSONTemplateReader.readFromObject((global as any).templateObject004);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);
  });
});
