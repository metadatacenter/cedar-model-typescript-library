import {
  CedarWriters,
  CedarYamlWriters,
  ComparisonResult,
  JsonTemplateElementReader,
  YamlObjectComparator,
  YamlTemplateElementReader,
} from '../../src';
import { TestUtil } from '../TestUtil';
import { elementTestNumbers } from './generatedTestCases';
import { TestResource } from '../TestResource';

describe('YAMLTemplateElementReader-references', () => {
  TestUtil.testNumbers(elementTestNumbers, [], []).forEach((elementTestNumber) => {
    it(`should correctly read the JSON template, create YAML output, reparse and reserialize YAML, and compare Y2Y: ${elementTestNumber}`, async () => {
      const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
      let comparisonResult: ComparisonResult = new ComparisonResult();
      let leftYAMLObject = {};
      let rightYAMLObject = {};
      try {
        const testResource: TestResource = TestResource.element(elementTestNumber);
        const elementSourceJSONString: string = TestUtil.readReferenceJson(testResource);

        const elementJSONReader: JsonTemplateElementReader = JsonTemplateElementReader.getStrict();
        const elementJSONReaderResult = elementJSONReader.readFromString(elementSourceJSONString);
        const jsonReadElement = elementJSONReaderResult.element;

        const elementYAMLWriter1 = writers.getTemplateElementWriter();
        const leftYAMLString = elementYAMLWriter1.getAsYamlString(jsonReadElement);
        leftYAMLObject = elementYAMLWriter1.getYamlAsJsonNode(jsonReadElement);

        const elementYAMLReader: YamlTemplateElementReader = YamlTemplateElementReader.getStrict();
        const elementYAMLReaderResult = elementYAMLReader.readFromString(leftYAMLString);
        const yamlReadElement = elementYAMLReaderResult.element;

        const elementYAMLWriter2 = writers.getTemplateElementWriter();
        // const rightYAMLString = elementYAMLWriter2.getAsYamlString(yamlReadElement);
        rightYAMLObject = elementYAMLWriter2.getYamlAsJsonNode(yamlReadElement);

        comparisonResult = YamlObjectComparator.compare(leftYAMLObject, rightYAMLObject);

        expect(comparisonResult.areEqual()).toBe(true);
      } catch (error) {
        console.log('Left yaml object');
        TestUtil.p(leftYAMLObject);
        console.log('Right yaml object');
        TestUtil.p(rightYAMLObject);
        TestUtil.p(comparisonResult.getComparisonErrors());
        console.error(`Failed to process element file: ${elementTestNumber}`, error);
        throw error;
      }
    });
  });
});
