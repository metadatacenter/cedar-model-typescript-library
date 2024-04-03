import fs from 'fs/promises';
import path from 'path';
import { CedarWriters, JSONTemplateReader, YAMLTemplateReader } from '../../src';
import { TestUtil } from '../TestUtil';
import { ComparisonResult } from '../../src/org/metadatacenter/model/cedar/util/compare/ComparisonResult';
import { YamlObjectComparator } from '../../src/org/metadatacenter/model/cedar/util/compare/YamlObjectComparator';
import { templateTestCases } from './generatedTestCases';

describe('YAMLReader-references', () => {
  // Generate a test for each file
  templateTestCases.forEach((sourcePath) => {
    it(`should correctly process file: ${path.basename(sourcePath)}`, async () => {
      const writers: CedarWriters = CedarWriters.getStrict();
      let comparisonResult: ComparisonResult = new ComparisonResult();
      let leftYAMLObject = {};
      let rightYAMLObject = {};
      try {
        // console.log(sourcePath);
        const templateSourceJSONString = await fs.readFile(sourcePath, 'utf8');

        const templateJSONReader: JSONTemplateReader = JSONTemplateReader.getStrict();
        const templateJSONReaderResult = templateJSONReader.readFromString(templateSourceJSONString);
        const jsonReadTemplate = templateJSONReaderResult.template;

        const templateYAMLWriter1 = writers.getYAMLTemplateWriter();
        const leftYAMLString = templateYAMLWriter1.getAsYamlString(jsonReadTemplate);
        leftYAMLObject = templateYAMLWriter1.getYamlAsJsonNode(jsonReadTemplate);

        const templateYAMLReader: YAMLTemplateReader = YAMLTemplateReader.getStrict();
        const templateYAMLReaderResult = templateYAMLReader.readFromString(leftYAMLString);
        const yamlReadTemplate = templateYAMLReaderResult.template;

        const templateYAMLWriter2 = writers.getYAMLTemplateWriter();
        // const rightYAMLString = templateYAMLWriter2.getAsYamlString(yamlReadTemplate);
        rightYAMLObject = templateYAMLWriter2.getYamlAsJsonNode(yamlReadTemplate);

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
