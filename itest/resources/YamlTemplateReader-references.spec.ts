import { CedarWriters, CedarYamlWriters, ComparisonResult, JsonTemplateReader, YamlObjectComparator, YamlTemplateReader } from '../../src';
import { TestUtil } from '../TestUtil';
import { templateTestNumbers } from './generatedTestCases';
import { TestResource } from '../TestResource';

describe('YAMLReader-references', () => {
  TestUtil.testNumbers(templateTestNumbers, [], [30]).forEach((templateTestNumber) => {
    it(`should correctly process template file: ${templateTestNumber}`, async () => {
      const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
      let comparisonResult: ComparisonResult = new ComparisonResult();
      let leftYAMLString = '';
      let rightYAMLString = '';
      let leftYAMLObject = {};
      let rightYAMLObject = {};
      try {
        const testResource: TestResource = TestResource.template(templateTestNumber);
        const templateSourceJSONString: string = TestUtil.readReferenceJson(testResource);

        const templateJSONReader: JsonTemplateReader = JsonTemplateReader.getStrict();
        const templateJSONReaderResult = templateJSONReader.readFromString(templateSourceJSONString);
        const jsonReadTemplate = templateJSONReaderResult.template;

        // console.log(jsonReadTemplate.getChildInfo('Textfield'));

        const templateYAMLWriter1 = writers.getTemplateWriter();
        leftYAMLString = templateYAMLWriter1.getAsYamlString(jsonReadTemplate);
        leftYAMLObject = templateYAMLWriter1.getYamlAsJsonNode(jsonReadTemplate);

        const templateYAMLReader: YamlTemplateReader = YamlTemplateReader.getStrict();
        const templateYAMLReaderResult = templateYAMLReader.readFromString(leftYAMLString);
        const yamlReadTemplate = templateYAMLReaderResult.template;

        // console.log(yamlReadTemplate.getChildInfo('Textfield'));

        const templateYAMLWriter2 = writers.getTemplateWriter();
        rightYAMLString = templateYAMLWriter2.getAsYamlString(yamlReadTemplate);
        rightYAMLObject = templateYAMLWriter2.getYamlAsJsonNode(yamlReadTemplate);

        comparisonResult = YamlObjectComparator.compare(leftYAMLObject, rightYAMLObject);

        expect(comparisonResult.areEqual()).toBe(true);
      } catch (error) {
        // console.log('Left yaml object');
        // console.log(leftYAMLString);
        // TestUtil.p(leftYAMLObject);
        // console.log('Right yaml object');
        // console.log(rightYAMLString);
        // TestUtil.p(rightYAMLObject);
        TestUtil.p(comparisonResult.getComparisonErrors());
        console.error(`Failed to process template file: ${templateTestNumber}`, error);
        throw error;
      }
    });
  });
});
