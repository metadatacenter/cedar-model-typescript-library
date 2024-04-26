import {
  CedarWriters,
  CedarYamlWriters,
  ComparisonResult,
  JsonTemplateFieldReader,
  YamlObjectComparator,
  YamlTemplateFieldReader,
} from '../../src';
import { TestUtil } from '../TestUtil';
import { fieldTestNumbers } from './generatedTestCases';
import { TestResource } from '../TestResource';

describe('YAMLTemplateFieldReader-references', () => {
  TestUtil.testNumbers(fieldTestNumbers, [], []).forEach((fieldTestNumber) => {
    it(`should correctly process file: ${fieldTestNumber}`, async () => {
      const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
      let comparisonResult: ComparisonResult = new ComparisonResult();
      let leftYAMLObject = {};
      let rightYAMLObject = {};
      try {
        const testResource: TestResource = TestResource.field(fieldTestNumber);
        const fieldSourceJSONString: string = TestUtil.readReferenceJson(testResource);

        const fieldJSONReader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
        const fieldJSONReaderResult = fieldJSONReader.readFromString(fieldSourceJSONString);
        const jsonReadField = fieldJSONReaderResult.field;

        const fieldYAMLWriter1 = writers.getFieldWriterForField(jsonReadField);
        const leftYAMLString = fieldYAMLWriter1.getAsYamlString(jsonReadField);
        leftYAMLObject = fieldYAMLWriter1.getYamlAsJsonNode(jsonReadField);

        const fieldYAMLReader: YamlTemplateFieldReader = YamlTemplateFieldReader.getStrict();
        const fieldYAMLReaderResult = fieldYAMLReader.readFromString(leftYAMLString);
        const yamlReadField = fieldYAMLReaderResult.field;

        const fieldYAMLWriter2 = writers.getFieldWriterForField(yamlReadField);
        // const rightYAMLString = fieldYAMLWriter2.getAsYamlString(yamlReadField);
        rightYAMLObject = fieldYAMLWriter2.getYamlAsJsonNode(yamlReadField);

        comparisonResult = YamlObjectComparator.compare(leftYAMLObject, rightYAMLObject);

        expect(comparisonResult.areEqual()).toBe(true);
      } catch (error) {
        console.log(leftYAMLObject);
        console.log(rightYAMLObject);
        TestUtil.p(comparisonResult.getComparisonErrors());
        console.error(`Failed to process field file: ${fieldTestNumber}`, error);
        throw error;
      }
    });
  });
});
