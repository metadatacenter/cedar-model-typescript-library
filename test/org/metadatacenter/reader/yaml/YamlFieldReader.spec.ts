import {
  CedarBuilders,
  CedarJsonWriters,
  CedarWriters,
  CedarYamlWriters,
  EmailField,
  EmailFieldBuilder,
  IsoDate,
  JsonTemplateFieldReader,
  SchemaVersion,
  YamlTemplateFieldReader,
} from '../../../../../src';
import { YamlObjectComparator } from '../../../../../src/org/metadatacenter/model/cedar/util/compare/YamlObjectComparator';
import { ComparisonResult } from '../../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonResult';

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
      .withBiboStatus('bibo:published')
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
