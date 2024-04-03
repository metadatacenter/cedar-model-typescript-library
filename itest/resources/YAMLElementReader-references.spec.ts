import fs from 'fs/promises';
import path from 'path';
import { CedarWriters, JSONElementReader, YAMLElementReader } from '../../src';
import { TestUtil } from '../TestUtil';
import { ComparisonResult } from '../../src/org/metadatacenter/model/cedar/util/compare/ComparisonResult';
import { YamlObjectComparator } from '../../src/org/metadatacenter/model/cedar/util/compare/YamlObjectComparator';
import { elementTestCases } from './generatedTestCases';

describe('YAMLElementReader-references', () => {
  // Generate a test for each file
  elementTestCases.forEach((sourcePath) => {
    it(`should correctly process file: ${path.basename(sourcePath)}`, async () => {
      const writers: CedarWriters = CedarWriters.getStrict();
      let comparisonResult: ComparisonResult = new ComparisonResult();
      let leftYAMLObject = {};
      let rightYAMLObject = {};
      try {
        // console.log(sourcePath);
        const elementSourceJSONString = await fs.readFile(sourcePath, 'utf8');

        const elementJSONReader: JSONElementReader = JSONElementReader.getStrict();
        const elementJSONReaderResult = elementJSONReader.readFromString(elementSourceJSONString);
        const jsonReadElement = elementJSONReaderResult.element;

        const elementYAMLWriter1 = writers.getYAMLTemplateElementWriter();
        const leftYAMLString = elementYAMLWriter1.getAsYamlString(jsonReadElement);
        leftYAMLObject = elementYAMLWriter1.getYamlAsJsonNode(jsonReadElement);

        const elementYAMLReader: YAMLElementReader = YAMLElementReader.getStrict();
        const elementYAMLReaderResult = elementYAMLReader.readFromString(leftYAMLString);
        const yamlReadElement = elementYAMLReaderResult.element;

        const elementYAMLWriter2 = writers.getYAMLTemplateElementWriter();
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
