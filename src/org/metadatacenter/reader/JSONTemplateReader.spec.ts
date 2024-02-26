import { JSONTemplateReader } from './JSONTemplateReader';
import { templateObjectSource01, templateStringSource01 } from '../../../../test/template-as-string/01';

test('reads empty template as string, should be not null', () => {
  const templateSourceString = '';
  const cedarTemplate = JSONTemplateReader.readFromString(templateSourceString);
  expect(cedarTemplate).not.toBeNull();
});

test('reads very simple template as string', () => {
  const cedarTemplate = JSONTemplateReader.readFromString(templateStringSource01);
  expect(cedarTemplate).not.toBeNull();
});

test('reads empty template as object, should be not null', () => {
  const templateSourceObject = {};
  const cedarTemplate = JSONTemplateReader.readFromObject(templateSourceObject);
  expect(cedarTemplate).not.toBeNull();
});

test('reads very simple template as string', () => {
  const cedarTemplate = JSONTemplateReader.readFromObject(templateObjectSource01);
  expect(cedarTemplate).not.toBeNull();
});
