import {
  CedarBuilders,
  CedarJsonWriters,
  CedarWriters,
  CedarYamlWriters,
  ComparisonResult,
  EmailField,
  EmailFieldBuilder,
  IsoDate,
  JsonTemplateFieldReader,
  SchemaVersion,
  YamlObjectComparator,
  YamlTemplateFieldReader,
} from '../../../../../src';

describe('YAMLFieldReader', () => {
  test('reads field built with a builder', () => {
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
      .withStatus('bibo:published')
      .withSchemaName('Email Schema Name')
      .withSchemaDescription('Description of the Email Schema')
      .withPreferredLabel('Email Field')
      .withAlternateLabels(['Email', 'Contact Email'])
      .build();

    const jsonWriters: CedarJsonWriters = CedarWriters.json().getStrict();
    const jsonWriter = jsonWriters.getFieldWriterForField(field);

    const fieldSourceJSONString = jsonWriter.getAsJsonString(field);
    // console.log('JSON generated from BUILDER', fieldSourceJSONString);

    const yamlWriters: CedarYamlWriters = CedarWriters.yaml().getStrict();
    const yamlWriter = yamlWriters.getFieldWriterForField(field);

    const fieldSourceYAMLString = yamlWriter.getAsYamlString(field);
    const fieldSourceYAMLObject = yamlWriter.getYamlAsJsonNode(field);

    // console.log('YAML generated from JSON', fieldSourceYAMLString);

    const fieldJSONReader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
    const fieldJSONReaderResult = fieldJSONReader.readFromString(fieldSourceJSONString);

    expect(fieldJSONReaderResult.parsingResult.wasSuccessful()).toBe(true);

    const fieldYAMLReader: YamlTemplateFieldReader = YamlTemplateFieldReader.getStrict();
    const fieldYAMLReaderResult = fieldYAMLReader.readFromString(fieldSourceYAMLString);

    const fieldYAMLWriter = yamlWriters.getFieldWriterForField(fieldYAMLReaderResult.field);
    const reYAMLString = fieldYAMLWriter.getAsYamlString(fieldYAMLReaderResult.field);
    const reYAMLObject = fieldYAMLWriter.getYamlAsJsonNode(fieldYAMLReaderResult.field);
    // console.log('YAML generated and re-parsed from YAML\n', reYAMLString);

    const comparisonResult: ComparisonResult = YamlObjectComparator.compare(fieldSourceYAMLObject, reYAMLObject);

    expect(comparisonResult.areEqual()).toBe(true);
  });
});

/**
 * A standalone field's value recommendation survives its own YAML round trip.
 *
 * The setting lives on the field itself for a field written on its own, and in the container's
 * deployment info for a child. The YAML writer states it at the document's top level for the
 * former, but only the container reader read the key, and only out of a child's configuration
 * block — so the library wrote a setting it could not read back, and a standalone field converted
 * through YAML came out with value recommendation off. The Java library reads both placements, and
 * the two libraries disagreed on production fields because of it.
 */
describe('a standalone field with value recommendation', () => {
  const roundTripToJson = (builder: any, enabled: boolean) => {
    const field = builder
      .withAtId('https://repo.metadatacenter.org/template-fields/00000000-0000-0000-0000-000000000000')
      .withSchemaName('Organism')
      .withSchemaDescription('d')
      .build();
    field.valueRecommendationEnabled = enabled;
    const yaml = CedarWriters.yaml().getStrict().getFieldWriterForField(field).getAsYamlString(field);
    const read = YamlTemplateFieldReader.getStrict().readFromString(yaml).field;
    return { yaml, json: JSON.parse(CedarWriters.json().getStrict().getFieldWriterForField(read).getAsJsonString(read)) };
  };

  test('comes back on a controlled term field', () => {
    const { yaml, json } = roundTripToJson(CedarBuilders.controlledTermFieldBuilder(), true);
    expect(yaml).toContain('valueRecommendation: true');
    expect(json['_ui'].valueRecommendationEnabled).toBe(true);
  });

  test('comes back on a text field', () => {
    const { yaml, json } = roundTripToJson(CedarBuilders.textFieldBuilder(), true);
    expect(yaml).toContain('valueRecommendation: true');
    expect(json['_ui'].valueRecommendationEnabled).toBe(true);
  });

  test('stays off, and unstated, where the field does not set it', () => {
    const { yaml, json } = roundTripToJson(CedarBuilders.textFieldBuilder(), false);
    expect(yaml).not.toContain('valueRecommendation');
    expect('valueRecommendationEnabled' in json['_ui']).toBe(false);
  });
});
