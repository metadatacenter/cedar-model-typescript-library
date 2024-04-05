import {
  AbstractArtifact,
  CedarArtifactType,
  CedarBuilders,
  CedarJsonWriters,
  CedarReaders,
  CedarWriters,
  ComparisonError,
  ComparisonErrorType,
  EmailField,
  EmailFieldBuilder,
  IsoDate,
  JsonAbstractArtifactReader,
  JsonPath,
  JsonSchema,
  RoundTrip,
  SchemaVersion,
} from '../../../../src';

describe('RoundTrip', () => {
  test('build an object, does the roundtrip', () => {
    const builder: EmailFieldBuilder = CedarBuilders.emailFieldBuilder();
    const now = IsoDate.now();
    const field: EmailField = builder
      .withAtId('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf')
      .withTitle('Email field title')
      .withDescription('Email field description')
      .withSchemaVersion(SchemaVersion.CURRENT)
      .withCreatedOn('2024-03-12T10:03:57-07:00')
      .withCreatedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95')
      .withLastUpdatedOn(now)
      .withModifiedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99')
      .withVersion('1.0.0')
      .withBiboStatus('bibo:published')
      .withSchemaName('Email Schema Name')
      .withSchemaDescription('Description of the Email Schema')
      .withPreferredLabel('Email Field')
      .withAlternateLabels(['Email', 'Contact Email'])
      .build();

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const jsonWriter = writers.getWriterForArtifact(field);

    const fieldSourceJSONString = jsonWriter.getAsJsonString(field);

    const cedarArtifactType: CedarArtifactType = CedarReaders.json().detectArtifactType(fieldSourceJSONString);
    const jsonReaders = CedarReaders.json().getStrict();

    const artifactReader: JsonAbstractArtifactReader = jsonReaders.getReaderForArtifactType(cedarArtifactType);

    const jsonArtifactReaderResult = artifactReader.readFromString(fieldSourceJSONString);
    expect(jsonArtifactReaderResult.parsingResult.getBlueprintComparisonErrorCount()).toBe(0);
    expect(jsonArtifactReaderResult.parsingResult.getBlueprintComparisonWarningCount()).toBe(0);

    const artifact: AbstractArtifact = jsonArtifactReaderResult.artifact;

    let templateReSerialized = jsonWriter.getAsJsonString(artifact);

    templateReSerialized = templateReSerialized.replace('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99', 'ABC');

    const compareResult = RoundTrip.compare(fieldSourceJSONString, templateReSerialized);
    // TestUtil.p(compareResult.getBlueprintComparisonErrors());
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(1);

    const uiPagesMissing = new ComparisonError(
      'oco03',
      ComparisonErrorType.VALUE_MISMATCH,
      new JsonPath(JsonSchema.oslcModifiedBy),
      'https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99',
      'ABC',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);

    expect(compareResult.getBlueprintComparisonWarningCount()).toBe(0);
  });
});
