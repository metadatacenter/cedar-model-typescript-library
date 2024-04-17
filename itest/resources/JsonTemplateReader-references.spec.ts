import { CedarJsonWriters, CedarWriters, JsonTemplateReader, JsonTemplateWriter, RoundTrip } from '../../src';
import { JsonArtifactParsingResult } from '../../src/org/metadatacenter/model/cedar/util/compare/JsonArtifactParsingResult';
import { JsonTemplateReaderResult } from '../../src/org/metadatacenter/io/reader/json/JsonTemplateReaderResult';
import { TestUtil } from '../TestUtil';

describe('JSONTemplateReader - CEDAR reference templates', () => {
  const files = [
    // 'ADVANCETemplate.json', // TODO: fix the file or the algorithm
    'CODEX.json',
    'DESI.json',
    'DataCiteTemplate.json',
    'LC-MS.json',
    'MALDI.json',
    'MultiInstanceFieldTemplate.json',
    'NanoSplits.json',
    // 'RADxMetadataSpecification.json', // TODO: fix the file or the algorithm
    'SIMS.json',
    'SampleBlock.json',
    // 'SampleFieldWithActions.json', Currently only parsing templates
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

  test.each(files)('reads template %s from CEDAR Artifact Library', (fileName) => {
    const templateSource = TestUtil.readOutsideResourceAsString('../cedar-artifact-library/src/test/resources/templates/', fileName);
    const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
    const jsonTemplateReaderResult: JsonTemplateReaderResult = reader.readFromString(templateSource);
    expect(jsonTemplateReaderResult).not.toBeNull();

    const parsingResult: JsonArtifactParsingResult = jsonTemplateReaderResult.parsingResult;
    if (!parsingResult.wasSuccessful()) {
      console.log('Parsing errors found for:', fileName);
      TestUtil.p(parsingResult.getBlueprintComparisonErrors());
    }
    // expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateWriter = writers.getTemplateWriter();

    const compareResult: JsonArtifactParsingResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

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
