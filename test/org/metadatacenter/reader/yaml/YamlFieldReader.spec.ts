import {
  CedarBuilders,
  CedarReaders,
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

/**
 * What a standalone field says about itself survives its own YAML round trip.
 *
 * Whether a field is hidden, and whether it demands a value, are the container's to state for a
 * child and the field's own when it is written alone. The model kept them only on the child
 * deployment info, so a field written on its own had nowhere to hold either: the JSON came back
 * with the field shown and optional however it was stored, and production fields disagreed with
 * the Java library because of it. The renderer states `hidden` at the document's top level and
 * `required` under `configuration`, and both placements are accepted from either.
 */
describe('a standalone field that is hidden or demands a value', () => {
  const roundTrip = (yaml: string) => {
    const read = YamlTemplateFieldReader.getStrict().readFromString(yaml);
    const json = JSON.parse(CedarWriters.json().getStrict().getFieldWriterForField(read.field).getAsJsonString(read.field));
    const backToYaml = CedarWriters.yaml().getStrict().getFieldWriterForField(read.field).getAsYamlString(read.field);
    return { json, backToYaml };
  };
  const base =
    'type: text-field\n' +
    'name: "Subject"\n' +
    'description: "d"\n' +
    'id: "https://repo.metadatacenter.org/template-fields/00000000-0000-0000-0000-000000000000"\n' +
    'modelVersion: 1.6.0\n';

  test('comes back hidden, and says so again', () => {
    const { json, backToYaml } = roundTrip(base + 'hidden: true\n');
    expect(json['_ui'].hidden).toBe(true);
    expect(backToYaml).toContain('hidden: true');
  });

  test('comes back demanding a value, and says so again', () => {
    const { json, backToYaml } = roundTrip(base + 'configuration:\n  required: true\n');
    expect(json['_valueConstraints'].requiredValue).toBe(true);
    expect(backToYaml).toContain('required: true');
  });

  test('accepts either placement, as the Java reader does', () => {
    expect(roundTrip(base + 'required: true\n').json['_valueConstraints'].requiredValue).toBe(true);
    expect(roundTrip(base + 'configuration:\n  hidden: true\n').json['_ui'].hidden).toBe(true);
  });

  test('stays shown and optional where the document says neither', () => {
    const { json, backToYaml } = roundTrip(base);
    expect('hidden' in json['_ui']).toBe(false);
    expect(json['_valueConstraints'].requiredValue).toBe(false);
    expect(backToYaml).not.toContain('hidden');
    expect(backToYaml).not.toContain('required');
  });

  test('keeps a line placement of its own', () => {
    const { json, backToYaml } = roundTrip(base + 'continuePreviousLine: true\n');
    expect(json['_ui'].continuePreviousLine).toBe(true);
    expect(backToYaml).toContain('continuePreviousLine: true');
  });
});

/**
 * A break carries the text it shows.
 *
 * Every static field's `_ui._content` is what the meta-schema asks of it, and the rich text, image
 * and YouTube fields each kept theirs. A page break and a section break had nowhere on the model
 * to put one, so both serializations read past it and wrote `_content: null` — the text an author
 * typed into a break did not survive being read at all.
 */
describe('a page break and a section break', () => {
  const breaks = [
    ['static-page-break', '_page_break_1'],
    ['static-section-break', '_section_break_1'],
  ] as const;

  test.each(breaks)('keeps its content through YAML: %s', (type, name) => {
    const yaml =
      `type: ${type}\n` +
      `name: "${name}"\n` +
      'id: "https://repo.metadatacenter.org/template-fields/00000000-0000-0000-0000-000000000000"\n' +
      'modelVersion: 1.6.0\n' +
      'content: "\u767b\u9332\u30c7\u30fc\u30bf / Registered Data"\n';
    const read = YamlTemplateFieldReader.getStrict().readFromString(yaml).field;
    const json = JSON.parse(CedarWriters.json().getStrict().getFieldWriterForField(read).getAsJsonString(read));
    expect(json['_ui']._content).toBe('\u767b\u9332\u30c7\u30fc\u30bf / Registered Data');

    const backToYaml = CedarWriters.yaml().getStrict().getFieldWriterForField(read).getAsYamlString(read);
    expect(backToYaml).toContain('\u767b\u9332\u30c7\u30fc\u30bf / Registered Data');
  });

  test.each(breaks)('keeps its content through JSON: %s', (type, name) => {
    const yaml =
      `type: ${type}\n` +
      `name: "${name}"\n` +
      'id: "https://repo.metadatacenter.org/template-fields/00000000-0000-0000-0000-000000000000"\n' +
      'modelVersion: 1.6.0\n' +
      'content: "Registered Data"\n';
    const fromYaml = YamlTemplateFieldReader.getStrict().readFromString(yaml).field;
    const asJson = CedarWriters.json().getStrict().getFieldWriterForField(fromYaml).getAsJsonString(fromYaml);
    const fromJson = CedarReaders.json().getStrict().getTemplateFieldReader().readFromString(asJson).field;
    const again = JSON.parse(CedarWriters.json().getStrict().getFieldWriterForField(fromJson).getAsJsonString(fromJson));
    expect(again['_ui']._content).toBe('Registered Data');
  });
});
