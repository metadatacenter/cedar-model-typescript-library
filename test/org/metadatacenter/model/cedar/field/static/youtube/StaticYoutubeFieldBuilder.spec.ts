import {
  CedarBuilders,
  CedarJsonWriters,
  CedarWriters,
  ChildDeploymentInfoStaticBuilder,
  IsoDate,
  JsonTemplateElementWriter,
  SchemaVersion,
  StaticYoutubeField,
  StaticYoutubeFieldBuilder,
  TemplateElement,
  TemplateElementBuilder,
} from '../../../../../../../../src';

describe('StaticYoutubeFieldBuilder', () => {
  test('creates youtube field with builder', () => {
    const builder: StaticYoutubeFieldBuilder = CedarBuilders.youtubeFieldBuilder();
    const now = IsoDate.now();
    const field: StaticYoutubeField = builder
      .withAtId('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf')
      .withTitle('Text field title')
      .withDescription('Text field description')
      .withSchemaVersion(SchemaVersion.CURRENT)
      .withCreatedOn('2024-03-12T10:03:57-07:00')
      .withCreatedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95')
      .withLastUpdatedOn(now)
      .withModifiedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99')
      .withVersion('0.0.2')
      .withStatus('bibo:published')
      .withSchemaName('Schema name of this template')
      .withSchemaDescription('Schema description of the template')
      .withPreferredLabel('Preferred label')
      .withAlternateLabels(['Alt label 1', 'Alt label 2', 'Alt label 3'])
      .withHeight(1080)
      .withWidth(1920)
      .withVideoId('dQw4w9WgXcQ')
      .build();

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const jsonWriter = writers.getFieldWriterForField(field);

    const stringified = jsonWriter.getAsJsonString(field);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['@id']).toBe('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf');
    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/StaticTemplateField');
    expect(backparsed['type']).toBe('object');
    expect(backparsed['title']).toBe('Text field title');
    expect(backparsed['description']).toBe('Text field description');

    expect(backparsed['_ui']).not.toBeNull();
    expect(backparsed['_ui']['inputType']).toBe('youtube');
    expect(backparsed['_ui']['_content']).toBe('dQw4w9WgXcQ');
    expect(backparsed['_ui']['_size']).toBeDefined();
    expect(backparsed['_ui']['_size']['width']).toBe(1920);
    expect(backparsed['_ui']['_size']['height']).toBe(1080);

    expect(backparsed['_ui']['valueRecommendationEnabled']).toBeUndefined();

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['required']).not.toBeNull();

    expect(backparsed['schema:name']).toBe('Schema name of this template');
    expect(backparsed['schema:description']).toBe('Schema description of the template');

    expect(backparsed['pav:createdOn']).toBe('2024-03-12T10:03:57-07:00');
    expect(backparsed['pav:createdBy']).toBe('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95');
    expect(backparsed['pav:lastUpdatedOn']).toBe(now.getValue());
    expect(backparsed['oslc:modifiedBy']).toBe('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99');

    expect(backparsed['schema:schemaVersion']).toBe('1.6.0');
    expect(backparsed['additionalProperties']).toBe(false);

    expect(backparsed['pav:version']).toBe('0.0.2');
    expect(backparsed['bibo:status']).toBe('bibo:published');
    expect(backparsed['$schema']).toBe('http://json-schema.org/draft-04/schema#');

    expect(backparsed['skos:prefLabel']).toBe('Preferred label');
    expect(backparsed['skos:altLabel']).toStrictEqual(['Alt label 1', 'Alt label 2', 'Alt label 3']);

    expect(backparsed['_valueConstraints']).toBeUndefined();
  });

  test('creates element with one youtube field, single-instance', () => {
    const youtubeFieldBuilder: StaticYoutubeFieldBuilder = CedarBuilders.youtubeFieldBuilder();
    const youtubeField: StaticYoutubeField = youtubeFieldBuilder.withTitle('Text field').build();

    const youtubeFieldDeploymentBuilder: ChildDeploymentInfoStaticBuilder = youtubeField.createDeploymentBuilder('youtube_field');

    const youtubeFieldDeployment = youtubeFieldDeploymentBuilder.withLabel('Youtube label ').withDescription('Youtube description').build();

    const templateElementBuilder: TemplateElementBuilder = CedarBuilders.templateElementBuilder();
    const templateElement: TemplateElement = templateElementBuilder.addChild(youtubeField, youtubeFieldDeployment).build();

    // console.log(TestUtil.d(templateElement.getChildrenInfo().children));

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();
    //
    const stringified = JSON.stringify(writer.getAsJsonNode(templateElement), null, 2);
    // console.log(stringified);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['properties']['youtube_field']).not.toBeNull();
    expect(backparsed['properties']['youtube_field']['type']).toBe('object');
    expect(backparsed['properties']['youtube_field']['items']).toBeUndefined();
  });
});
