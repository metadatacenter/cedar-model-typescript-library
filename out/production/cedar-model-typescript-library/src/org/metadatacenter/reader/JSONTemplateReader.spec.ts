import { JSONTemplateReader } from './JSONTemplateReader';

test('reads empty template as string, should be not null', () => {
  const templateSourceString = '';
  const jsonTemplateReaderResult = JSONTemplateReader.readFromString(templateSourceString);
  expect(jsonTemplateReaderResult).not.toBeNull();
});
//
// test('reads empty template as object, should be not null', () => {
//   const templateSourceObject = {};
//   const jsonTemplateReaderResult = JSONTemplateReader.readFromObject(templateSourceObject);
//   expect(jsonTemplateReaderResult).not.toBeNull();
// });
//
// test('reads very simple template as string, before save', () => {
//   const jsonTemplateReaderResult = JSONTemplateReader.readFromString((global as any).templateSource001);
//   expect(jsonTemplateReaderResult).not.toBeNull();
// });
//
// test('reads very simple template as string, before save', () => {
//   const jsonTemplateReaderResult = JSONTemplateReader.readFromObject((global as any).templateObject001);
//   expect(jsonTemplateReaderResult).not.toBeNull();
// });
//
// test('reads very simple template as string, after save', () => {
//   const jsonTemplateReaderResult = JSONTemplateReader.readFromObject((global as any).templateObject002);
//   console.log(jsonTemplateReaderResult.template);
//   console.log(JSON.stringify(jsonTemplateReaderResult.template, null, 2));
//   expect(jsonTemplateReaderResult).not.toBeNull();
// });
