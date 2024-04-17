import fs from 'fs/promises';
import path from 'path';
import {
  CedarWriters,
  CedarYamlWriters,
  ComparisonResult,
  JsonTemplateElementReader,
  YamlObjectComparator,
  YamlTemplateElementReader,
} from '../../src';
import { TestUtil } from '../TestUtil';
import { elementTestCases } from './generatedTestCases';

describe('YAMLTemplateElementReader-references', () => {
  // Generate a test for each file
  elementTestCases.forEach((sourcePath) => {
    it(`should correctly process file: ${path.basename(sourcePath)}`, async () => {
      const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
      let comparisonResult: ComparisonResult = new ComparisonResult();
      let leftYAMLObject = {};
      let rightYAMLObject = {};
      try {
        // console.log(sourcePath);
        const elementSourceJSONString = await fs.readFile(sourcePath, 'utf8');

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
        console.error(`Failed to process file: ${sourcePath}`, error);
        throw error;
      }
    });
  });
});
