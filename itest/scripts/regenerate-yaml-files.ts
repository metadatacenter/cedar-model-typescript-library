import { elementTestNumbers, fieldTestNumbers, templateTestNumbers } from '../resources/generatedTestCases';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';
import {
  CedarWriters,
  CedarYamlWriters,
  JsonTemplateElementReader,
  JsonTemplateFieldReader,
  JsonTemplateReader,
  YamlTemplateElementWriter,
  YamlTemplateFieldWriter,
  YamlTemplateWriter,
} from '../../src';

templateTestNumbers.forEach((templateTestNumber) => {
  //if (!skipTests.includes(templateTestNumber)) {
  //    if (templateTestNumber == 6) {
  try {
    const testResource: TestResource = TestResource.template(templateTestNumber);
    const artifactSource: string = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(artifactSource);
    // expect(jsonTemplateReaderResult).not.toBeNull();
    // const parsingResult = jsonTemplateReaderResult.parsingResult;
    // expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
    const yamlWriter: YamlTemplateWriter = writers.getTemplateWriter();

    const stringified = yamlWriter.getAsYamlString(jsonTemplateReaderResult.template);

    TestUtil.writeSerializedYaml(testResource, stringified);
  } catch (error) {
    console.error(`Failed to process template file: ${templateTestNumber}`, error);
    throw error;
  }
});

elementTestNumbers.forEach((templateElementTestNumber) => {
  //if (!skipTests.includes(templateElementTestNumber)) {
  //    if (templateElementTestNumber == 6) {
  try {
    const testResource: TestResource = TestResource.element(templateElementTestNumber);
    const artifactSource: string = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateElementReader = JsonTemplateElementReader.getStrict();
    const jsonTemplateElementReaderResult = reader.readFromString(artifactSource);
    // expect(jsonTemplateElementReaderResult).not.toBeNull();
    // const parsingResult = jsonTemplateElementReaderResult.parsingResult;
    // expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
    const yamlWriter: YamlTemplateElementWriter = writers.getTemplateElementWriter();

    const stringified = yamlWriter.getAsYamlString(jsonTemplateElementReaderResult.element);

    TestUtil.writeSerializedYaml(testResource, stringified);
  } catch (error) {
    console.error(`Failed to process templateElement file: ${templateElementTestNumber}`, error);
    throw error;
  }
});

fieldTestNumbers.forEach((templateFieldTestNumber) => {
  //if (!skipTests.includes(templateFieldTestNumber)) {
  //    if (templateFieldTestNumber == 6) {
  try {
    const testResource: TestResource = TestResource.field(templateFieldTestNumber);
    const artifactSource: string = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
    const jsonTemplateFieldReaderResult = reader.readFromString(artifactSource);
    // expect(jsonTemplateFieldReaderResult).not.toBeNull();
    // const parsingResult = jsonTemplateFieldReaderResult.parsingResult;
    // expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
    const yamlWriter: YamlTemplateFieldWriter = writers.getFieldWriterForField(jsonTemplateFieldReaderResult.field);

    const stringified = yamlWriter.getAsYamlString(jsonTemplateFieldReaderResult.field);

    TestUtil.writeSerializedYaml(testResource, stringified);
  } catch (error) {
    console.error(`Failed to process templateField file: ${templateFieldTestNumber}`, error);
    throw error;
  }
});
