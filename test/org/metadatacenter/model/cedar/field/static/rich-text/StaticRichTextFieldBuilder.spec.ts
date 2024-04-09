import {
  CedarBuilders,
  CedarJsonWriters,
  CedarWriters,
  IsoDate,
  JsonTemplateElementWriter,
  SchemaVersion,
  StaticRichTextField,
  StaticRichTextFieldBuilder,
  TemplateElement,
  TemplateElementBuilder,
} from '../../../../../../../../src';
import { ChildDeploymentInfoAlwaysSingleBuilder } from '../../../../../../../../src/org/metadatacenter/model/cedar/deployment/ChildDeploymentInfoAlwaysSingleBuilder';

describe('StaticRichTextFieldBuilder', () => {
  test('creates rich text field with builder', () => {
    const builder: StaticRichTextFieldBuilder = CedarBuilders.richTextFieldBuilder();
    const now = IsoDate.now();
    const field: StaticRichTextField = builder
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
      .withSchemaName('Schema nam of this template')
      .withSchemaDescription('Schema description of the template')
      .withPreferredLabel('Preferred label')
      .withAlternateLabels(['Alt label 1', 'Alt label 2', 'Alt label 3'])
      .withContent('<p>Rich text</p>')
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
    expect(backparsed['_ui']['inputType']).toBe('richtext');
    expect(backparsed['_ui']['_content']).toBe('<p>Rich text</p>');

    expect(backparsed['_ui']['valueRecommendationEnabled']).toBeUndefined();

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['required']).not.toBeNull();

    expect(backparsed['schema:name']).toBe('Schema nam of this template');
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

  test('creates element with one richText field, single-instance', () => {
    const richTextFieldBuilder: StaticRichTextFieldBuilder = CedarBuilders.richTextFieldBuilder();
    const richTextField: StaticRichTextField = richTextFieldBuilder.withTitle('Text field').build();

    const richTextFieldDeploymentBuilder: ChildDeploymentInfoAlwaysSingleBuilder = richTextField.createDeploymentBuilder('rich_text_field');

    const richTextFieldDeployment = richTextFieldDeploymentBuilder
      .withIri('https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde')
      .build();

    const templateElementBuilder: TemplateElementBuilder = CedarBuilders.templateElementBuilder();
    const templateElement: TemplateElement = templateElementBuilder.addChild(richTextField, richTextFieldDeployment).build();

    // console.log(TestUtil.d(templateElement.getChildrenInfo().children));

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();
    //
    const stringified = JSON.stringify(writer.getAsJsonNode(templateElement), null, 2);
    // console.log(stringified);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['properties']['rich_text_field']).not.toBeNull();
    expect(backparsed['properties']['rich_text_field']['type']).toBe('object');
    expect(backparsed['properties']['rich_text_field']['items']).toBeUndefined();
  });
});
