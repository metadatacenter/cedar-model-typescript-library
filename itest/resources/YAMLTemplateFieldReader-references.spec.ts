import fs from 'fs/promises';
import path from 'path';
import { CedarWriters, CedarYAMLWriters, JsonTemplateFieldReader, YAMLTemplateFieldReader } from '../../src';
import { TestUtil } from '../TestUtil';
import { ComparisonResult } from '../../src/org/metadatacenter/model/cedar/util/compare/ComparisonResult';
import { YamlObjectComparator } from '../../src/org/metadatacenter/model/cedar/util/compare/YamlObjectComparator';
import { fieldTestCases } from './generatedTestCases';

describe('YAMLTemplateFieldReader-references', () => {
  // Generate a test for each file
  fieldTestCases.forEach((sourcePath) => {
    it(`should correctly process file: ${path.basename(sourcePath)}`, async () => {
      const writers: CedarYAMLWriters = CedarWriters.yaml().getStrict();
      let comparisonResult: ComparisonResult = new ComparisonResult();
      let leftYAMLObject = {};
      let rightYAMLObject = {};
      try {
        // console.log(sourcePath);
        const fieldSourceJSONString = await fs.readFile(sourcePath, 'utf8');

        const fieldJSONReader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
        const fieldJSONReaderResult = fieldJSONReader.readFromString(fieldSourceJSONString);
        const jsonReadField = fieldJSONReaderResult.field;

        const fieldYAMLWriter1 = writers.getYAMLFieldWriterForField(jsonReadField);
        const leftYAMLString = fieldYAMLWriter1.getAsYamlString(jsonReadField);
        leftYAMLObject = fieldYAMLWriter1.getYamlAsJsonNode(jsonReadField);

        const fieldYAMLReader: YAMLTemplateFieldReader = YAMLTemplateFieldReader.getStrict();
        const fieldYAMLReaderResult = fieldYAMLReader.readFromString(leftYAMLString);
        const yamlReadField = fieldYAMLReaderResult.field;

        const fieldYAMLWriter2 = writers.getYAMLFieldWriterForField(yamlReadField);
        // const rightYAMLString = fieldYAMLWriter2.getAsYamlString(yamlReadField);
        rightYAMLObject = fieldYAMLWriter2.getYamlAsJsonNode(yamlReadField);

        comparisonResult = YamlObjectComparator.compare(leftYAMLObject, rightYAMLObject);

        expect(comparisonResult.areEqual()).toBe(true);
      } catch (error) {
        console.log(leftYAMLObject);
        console.log(rightYAMLObject);
        TestUtil.p(comparisonResult.getComparisonErrors());
        console.error(`Failed to process file: ${sourcePath}`, error);
        throw error;
      }
    });
  });
});
