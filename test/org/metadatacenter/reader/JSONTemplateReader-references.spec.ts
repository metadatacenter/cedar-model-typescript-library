import { JSONTemplateReader } from '../../../../src/org/metadatacenter/io/reader/JSONTemplateReader';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import { JSONTemplateReaderResult } from '../../../../src/org/metadatacenter/io/reader/JSONTemplateReaderResult';
import { JSONTemplateWriter } from '../../../../src/org/metadatacenter/io/writer/JSONTemplateWriter';
import { CedarWriters } from '../../../../src/org/metadatacenter/io/writer/CedarWriters';

xdescribe('JSONTemplateReader - CEDAR reference templates', () => {
  test('reads template from CEDAR Artifact Library', () => {
    const files = [
      'ADVANCETemplate.json',
      'CODEX.json',
      'DESI.json',
      'DataCiteTemplate.json',
      'LC-MS.json',
      'MALDI.json',
      'MultiInstanceFieldTemplate.json',
      'NanoSplits.json',
      'RADxMetadataSpecification.json',
      'SIMS.json',
      'SampleBlock.json',
      'SampleFieldWithActions.json',
      'SampleSection.json',
      'SampleSuspension.json',
      'SimpleTemplate.json',
      'SimpleTemplateWithAttributeValues.json',
      'TemplateWithActions.json',
      'HuBMAP/CODEX.json',
      'HuBMAP/DESI.json',
      'HuBMAP/LC-MS.json',
      'HuBMAP/MALDI.json',
      'HuBMAP/NanoSplits.json',
      'HuBMAP/SIMS.json',
    ];

    files.forEach((fileName) => {
      console.log('Working on file:', fileName);
      const templateSource = TestUtil.readOutsideResourceAsString('../cedar-artifact-library/src/test/resources/templates/', fileName);
      const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
      const jsonTemplateReaderResult: JSONTemplateReaderResult = reader.readFromString(templateSource);
      expect(jsonTemplateReaderResult).not.toBeNull();

      const parsingResult: ParsingResult = jsonTemplateReaderResult.parsingResult;
      TestUtil.p(parsingResult.getBlueprintComparisonErrors());
      // expect(parsingResult.wasSuccessful()).toBe(true);

      const writers: CedarWriters = CedarWriters.getStrict();
      const writer: JSONTemplateWriter = writers.getJSONTemplateWriter();

      const compareResult: ParsingResult = JSONTemplateReader.getRoundTripComparisonResult(jsonTemplateReaderResult, writer);

      // TestUtil.p(compareResult);
      // TestUtil.p(writer.getAsJsonNode(jsonTemplateReaderResult.template));
      // TestUtil.p(jsonTemplateReaderResult.template);

      expect(compareResult.wasSuccessful()).toBe(false);
      //expect(compareResult.getBlueprintComparisonErrorCount()).toBe(3);

      // const uiPagesMissing = new ComparisonError(
      //   ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      //   new CedarJsonPath(CedarModel.ui, CedarModel.pages),
      // );
      // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);
      //
      // const requiredControlled1Unexpected = new ComparisonError(
      //   ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      //   new CedarJsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 11),
      //   undefined,
      //   'Controlled',
      // );
      // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredControlled1Unexpected);
      //
      // const skosNotationControlled1Unexpected = new ComparisonError(
      //   ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      //   new CedarJsonPath(JsonSchema.properties, 'Controlled', JsonSchema.items, JsonSchema.properties, CedarModel.skosNotation),
      // );
      // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(skosNotationControlled1Unexpected);
    });
  });
});
