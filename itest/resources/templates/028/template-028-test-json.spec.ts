import {
  CedarJsonWriters,
  CedarModel,
  CedarWriters,
  ComparisonError,
  ComparisonErrorType,
  JsonPath,
  JsonTemplateReader,
  JsonTemplateWriter,
  RoundTrip,
  TemplateChild,
  TemplateElement,
} from '../../../../src';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import { TestResource } from '../../../TestResource';
import { AbstractChildDeploymentInfo } from '../../../../src/org/metadatacenter/model/cedar/deployment/AbstractChildDeploymentInfo';

const testResource: TestResource = TestResource.template(28);

describe('JSONTemplateReader' + testResource.toString(), () => {
  test('reads template witch annotations', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateReader = JsonTemplateReader.getFebruary2024();
    const jsonTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    // TestUtil.p(jsonTemplateReaderResult.template);

    const writers: CedarJsonWriters = CedarWriters.json().getFebruary2024();
    const writer: JsonTemplateWriter = writers.getTemplateWriter();

    // console.log(jsonTemplateReaderResult.templateSourceObject);

    const compareResult: ParsingResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

    // TestUtil.p(compareResult);
    const template = jsonTemplateReaderResult.template;
    const name1 = 'Read & Understood Catalog';
    const info1: AbstractChildDeploymentInfo | null = template.getChildInfo(name1);
    const child1: TemplateElement | null = template.getElement(name1);

    const name2 = 'Read & Understood';
    const info2: AbstractChildDeploymentInfo | null = child1?.getChildInfo(name2) ?? null;
    const child2: TemplateChild | null = child1?.getChild(name2) ?? null;

    expect(info1).not.toBeNull();
    expect(child1).not.toBeNull();
    expect(info2).not.toBeNull();
    expect(child2).not.toBeNull();

    // console.log(TestUtil.d(info1));
    // console.log(TestUtil.d(child1));
    // console.log(TestUtil.d(info2));
    //    console.log(TestUtil.d(child2));
    // TestUtil.p(writer.getAsJsonNode(jsonTemplateReaderResult.template));

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(3);

    const missingPropDesc1 = new ComparisonError(
      'oco02',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.propertyDescriptions, 'Read & Understood'),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(missingPropDesc1);

    const missingPropDesc2 = new ComparisonError(
      'oco02',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.propertyDescriptions, 'ProjectAdminIntanceID'),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(missingPropDesc2);

    const missingPropDesc3 = new ComparisonError(
      'oco02',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.propertyDescriptions, 'ProjectAdminInstanceIDRT'),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(missingPropDesc3);
  });
});
