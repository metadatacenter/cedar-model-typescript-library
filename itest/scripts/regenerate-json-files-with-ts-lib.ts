import { elementTestNumbers, fieldTestNumbers, templateTestNumbers } from '../resources/generatedTestCases';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';
import {
  CedarJsonWriters,
  CedarWriters,
  JsonTemplateElementReader,
  JsonTemplateElementReaderResult,
  JsonTemplateElementWriter,
  JsonTemplateFieldReader,
  JsonTemplateFieldReaderResult,
  JsonTemplateFieldWriter,
  JsonTemplateReader,
  JsonTemplateReaderResult,
  JsonTemplateWriter,
} from '../../src';

function generateForTemplates() {
  for (const templateTestNumber of templateTestNumbers) {
    try {
      const testResource: TestResource = TestResource.template(templateTestNumber);
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
      const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
      const jsonTemplateReaderResult: JsonTemplateReaderResult = reader.readFromString(artifactSource);

      const writers: CedarJsonWriters = CedarWriters.json().getStrict();
      const jsonWriter: JsonTemplateWriter = writers.getTemplateWriter();

      const stringified = jsonWriter.getAsJsonString(jsonTemplateReaderResult.template);

      TestUtil.writeSerializedJson(testResource, stringified + '\n');
    } catch (error) {
      console.error(`Failed to process template file: ${templateTestNumber}`, error);
      throw error;
    }
  }
}

function generateForElements() {
  for (const templateElementTestNumber of elementTestNumbers) {
    try {
      const testResource: TestResource = TestResource.element(templateElementTestNumber);
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
      const reader: JsonTemplateElementReader = JsonTemplateElementReader.getStrict();
      const jsonTemplateElementReaderResult: JsonTemplateElementReaderResult = reader.readFromString(artifactSource);

      const writers: CedarJsonWriters = CedarWriters.json().getStrict();
      const jsonWriter: JsonTemplateElementWriter = writers.getTemplateElementWriter();

      const stringified = jsonWriter.getAsJsonString(jsonTemplateElementReaderResult.element);

      TestUtil.writeSerializedJson(testResource, stringified + '\n');
    } catch (error) {
      console.error(`Failed to process templateElement file: ${templateElementTestNumber}`, error);
      throw error;
    }
  }
}

function generateForFields() {
  for (const templateFieldTestNumber of fieldTestNumbers) {
    try {
      const testResource: TestResource = TestResource.field(templateFieldTestNumber);
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
      const reader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
      const jsonTemplateFieldReaderResult: JsonTemplateFieldReaderResult = reader.readFromString(artifactSource);

      const writers: CedarJsonWriters = CedarWriters.json().getStrict();
      const jsonWriter: JsonTemplateFieldWriter = writers.getFieldWriterForField(jsonTemplateFieldReaderResult.field);

      const stringified = jsonWriter.getAsJsonString(jsonTemplateFieldReaderResult.field);

      TestUtil.writeSerializedJson(testResource, stringified + '\n');
    } catch (error) {
      console.error(`Failed to process templateField file: ${templateFieldTestNumber}`, error);
      throw error;
    }
  }
}

export function generateJsonUsingTypeScript() {
  generateForTemplates();
  generateForElements();
  generateForFields();
}

generateJsonUsingTypeScript();
