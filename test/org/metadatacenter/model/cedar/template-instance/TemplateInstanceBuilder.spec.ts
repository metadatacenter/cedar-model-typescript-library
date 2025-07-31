import {
  BiboStatus,
  CedarArtifactId,
  CedarBuilders,
  CedarJsonWriters,
  CedarWriters,
  IsoDate,
  SchemaVersion,
  TemplateInstance,
  TemplateInstanceBuilder,
} from '../../../../../../src';
import { JsonTemplateInstanceWriter } from '../../../../../../src/org/metadatacenter/io/writer/json/JsonTemplateInstanceWriter';
import { InstanceDataStringAtom } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataStringAtom';
import { InstanceDataLinkAtom } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataLinkAtom';
import { InstanceDataContainer } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataContainer';
import { InstanceDataAtomList } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataAtomList';
import * as fs from 'fs';
import * as path from 'path';

describe('TemplateInstanceBuilder', () => {
  test('creates empty template instance with basic properties', () => {
    const now = IsoDate.now();
    const templateInstanceBuilder: TemplateInstanceBuilder = CedarBuilders.templateInstanceBuilder();
    const templateInstance: TemplateInstance = templateInstanceBuilder
      .withAtId('https://repo.metadatacenter.org/template-instances/f38b5ef4-a078-4d82-90c0-a9a721ad5999')
      .withSchemaName('Test Template Instance')
      .withSchemaDescription('A test template instance')
      .withCreatedOn('2024-03-12T10:03:57-07:00')
      .withCreatedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95')
      .withLastUpdatedOn(now.getValue())
      .withModifiedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99')
      .withSchemaIsBasedOn('https://repo.metadatacenter.org/templates/f38b5ef4-a078-4d82-90c0-a9a721ad5888')
      .build();

    expect(templateInstance.at_id.getValue()).toBe(
      'https://repo.metadatacenter.org/template-instances/f38b5ef4-a078-4d82-90c0-a9a721ad5999',
    );
    expect(templateInstance.schema_name).toBe('Test Template Instance');
    expect(templateInstance.schema_description).toBe('A test template instance');
    expect(templateInstance.schema_isBasedOn.getValue()).toBe(
      'https://repo.metadatacenter.org/templates/f38b5ef4-a078-4d82-90c0-a9a721ad5888',
    );
    expect(templateInstance.cedarArtifactType.getValue()).toBe('TemplateInstance');
  });

  test('creates template instance with string data values', () => {
    const templateInstanceBuilder: TemplateInstanceBuilder = CedarBuilders.templateInstanceBuilder();
    const templateInstance: TemplateInstance = templateInstanceBuilder
      .withAtId('https://repo.metadatacenter.org/template-instances/f38b5ef4-a078-4d82-90c0-a9a721ad5999')
      .withSchemaName('Test Template Instance')
      .withSchemaIsBasedOn('https://repo.metadatacenter.org/templates/f38b5ef4-a078-4d82-90c0-a9a721ad5888')
      .withDataValue('_text_field', new InstanceDataStringAtom('Sample text value'))
      .withDataValue('_email_field', new InstanceDataStringAtom('test@example.com'))
      .withDataValue('_description_field', new InstanceDataStringAtom('This is a description'))
      .build();

    expect(templateInstance.dataContainer.values['_text_field']).toBeInstanceOf(InstanceDataStringAtom);
    expect((templateInstance.dataContainer.values['_text_field'] as InstanceDataStringAtom).value).toBe('Sample text value');
    expect((templateInstance.dataContainer.values['_email_field'] as InstanceDataStringAtom).value).toBe('test@example.com');
    expect((templateInstance.dataContainer.values['_description_field'] as InstanceDataStringAtom).value).toBe('This is a description');
  });

  test('creates template instance with link data values', () => {
    const templateInstanceBuilder: TemplateInstanceBuilder = CedarBuilders.templateInstanceBuilder();
    const templateInstance: TemplateInstance = templateInstanceBuilder
      .withAtId('https://repo.metadatacenter.org/template-instances/f38b5ef4-a078-4d82-90c0-a9a721ad5999')
      .withSchemaName('Test Template Instance')
      .withSchemaIsBasedOn('https://repo.metadatacenter.org/templates/f38b5ef4-a078-4d82-90c0-a9a721ad5888')
      .withDataValue('_link_field', new InstanceDataLinkAtom('https://example.com/resource/123'))
      .withDataValue('_reference_field', new InstanceDataLinkAtom('https://schema.org/Person'))
      .build();

    expect(templateInstance.dataContainer.values['_link_field']).toBeInstanceOf(InstanceDataLinkAtom);
    expect((templateInstance.dataContainer.values['_link_field'] as InstanceDataLinkAtom).id).toBe('https://example.com/resource/123');
    expect((templateInstance.dataContainer.values['_reference_field'] as InstanceDataLinkAtom).id).toBe('https://schema.org/Person');
  });

  test('creates template instance with data IRIs', () => {
    const templateInstanceBuilder: TemplateInstanceBuilder = CedarBuilders.templateInstanceBuilder();
    const templateInstance: TemplateInstance = templateInstanceBuilder
      .withAtId('https://repo.metadatacenter.org/template-instances/f38b5ef4-a078-4d82-90c0-a9a721ad5999')
      .withSchemaName('Test Template Instance')
      .withSchemaIsBasedOn('https://repo.metadatacenter.org/templates/f38b5ef4-a078-4d82-90c0-a9a721ad5888')
      .withDataIri('_text_field', 'https://schema.metadatacenter.org/properties/text-field-iri')
      .withDataIri('_email_field', 'https://schema.metadatacenter.org/properties/email-field-iri')
      .build();

    expect(templateInstance.dataContainer.iris['_text_field']).toBe('https://schema.metadatacenter.org/properties/text-field-iri');
    expect(templateInstance.dataContainer.iris['_email_field']).toBe('https://schema.metadatacenter.org/properties/email-field-iri');
  });

  test('creates template instance with data container ID', () => {
    const templateInstanceBuilder: TemplateInstanceBuilder = CedarBuilders.templateInstanceBuilder();
    const templateInstance: TemplateInstance = templateInstanceBuilder
      .withAtId('https://repo.metadatacenter.org/template-instances/f38b5ef4-a078-4d82-90c0-a9a721ad5999')
      .withSchemaName('Test Template Instance')
      .withSchemaIsBasedOn('https://repo.metadatacenter.org/templates/f38b5ef4-a078-4d82-90c0-a9a721ad5888')
      .withDataId('instance-data-container-id')
      .build();

    expect(templateInstance.dataContainer.id).toBe('instance-data-container-id');
  });

  test('creates template instance with custom data container', () => {
    const customDataContainer = new InstanceDataContainer();
    customDataContainer.setValue('_custom_field', new InstanceDataStringAtom('Custom value'));
    customDataContainer.setIri('_custom_field', 'https://schema.metadatacenter.org/properties/custom-field-iri');
    customDataContainer.id = 'custom-container-id';

    const templateInstanceBuilder: TemplateInstanceBuilder = CedarBuilders.templateInstanceBuilder();
    const templateInstance: TemplateInstance = templateInstanceBuilder
      .withAtId('https://repo.metadatacenter.org/template-instances/f38b5ef4-a078-4d82-90c0-a9a721ad5999')
      .withSchemaName('Test Template Instance')
      .withSchemaIsBasedOn('https://repo.metadatacenter.org/templates/f38b5ef4-a078-4d82-90c0-a9a721ad5888')
      .withDataContainer(customDataContainer)
      .build();

    expect(templateInstance.dataContainer.id).toBe('custom-container-id');
    expect(templateInstance.dataContainer.values['_custom_field']).toBeInstanceOf(InstanceDataStringAtom);
    expect((templateInstance.dataContainer.values['_custom_field'] as InstanceDataStringAtom).value).toBe('Custom value');
    expect(templateInstance.dataContainer.iris['_custom_field']).toBe('https://schema.metadatacenter.org/properties/custom-field-iri');
  });

  test('creates template instance with all properties and serializes to JSON', () => {
    const now = IsoDate.now();
    const templateInstanceBuilder: TemplateInstanceBuilder = CedarBuilders.templateInstanceBuilder();
    const templateInstance: TemplateInstance = templateInstanceBuilder
      .withAtId('https://repo.metadatacenter.org/template-instances/f38b5ef4-a078-4d82-90c0-a9a721ad5999')
      .withSchemaName('Complete Test Template Instance')
      .withSchemaDescription('A complete test template instance with all properties')
      .withCreatedOn('2024-03-12T10:03:57-07:00')
      .withCreatedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95')
      .withLastUpdatedOn(now.getValue())
      .withModifiedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99')
      .withDerivedFrom(CedarArtifactId.forValue('https://repo.metadatacenter.org/templates/f38b5ef4-a078-4d82-90c0-a9a721ad5888'))
      .withSchemaIsBasedOn('https://repo.metadatacenter.org/templates/f38b5ef4-a078-4d82-90c0-a9a721ad5888')
      .withDataValue('_text_field', new InstanceDataStringAtom('Sample text value'))
      .withDataValue('_email_field', new InstanceDataStringAtom('test@example.com'))
      .withDataValue('_link_field', new InstanceDataLinkAtom('https://example.com/resource/123'))
      .withDataIri('_text_field', 'https://schema.metadatacenter.org/properties/text-field-iri')
      .withDataIri('_email_field', 'https://schema.metadatacenter.org/properties/email-field-iri')
      .withDataIri('_link_field', 'https://schema.metadatacenter.org/properties/link-field-iri')
      .withDataId('complete-instance-container-id')
      .build();

    // Test serialization
    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateInstanceWriter = writers.getTemplateInstanceWriter();

    const stringified = JSON.stringify(writer.getAsJsonNode(templateInstance), null, 2);
    const backparsed = JSON.parse(stringified);

    // The @id in the JSON is the data container ID, not the instance ID
    expect(backparsed['@id']).toBe('complete-instance-container-id');
    expect(backparsed['schema:name']).toBe('Complete Test Template Instance');
    expect(backparsed['schema:description']).toBe('A complete test template instance with all properties');
    expect(backparsed['schema:isBasedOn']).toBe('https://repo.metadatacenter.org/templates/f38b5ef4-a078-4d82-90c0-a9a721ad5888');
    expect(backparsed['pav:derivedFrom']).toBe('https://repo.metadatacenter.org/templates/f38b5ef4-a078-4d82-90c0-a9a721ad5888');
  });

  test('creates template instance with CedarArtifactId objects', () => {
    const templateInstanceBuilder: TemplateInstanceBuilder = CedarBuilders.templateInstanceBuilder();
    const templateInstance: TemplateInstance = templateInstanceBuilder
      .withAtId(CedarArtifactId.forValue('https://repo.metadatacenter.org/template-instances/f38b5ef4-a078-4d82-90c0-a9a721ad5999'))
      .withSchemaName('Test Template Instance')
      .withSchemaIsBasedOn(CedarArtifactId.forValue('https://repo.metadatacenter.org/templates/f38b5ef4-a078-4d82-90c0-a9a721ad5888'))
      .build();

    expect(templateInstance.at_id.getValue()).toBe(
      'https://repo.metadatacenter.org/template-instances/f38b5ef4-a078-4d82-90c0-a9a721ad5999',
    );
    expect(templateInstance.schema_isBasedOn.getValue()).toBe(
      'https://repo.metadatacenter.org/templates/f38b5ef4-a078-4d82-90c0-a9a721ad5888',
    );
  });

  test('creates template instance with null values', () => {
    const templateInstanceBuilder: TemplateInstanceBuilder = CedarBuilders.templateInstanceBuilder();
    const templateInstance: TemplateInstance = templateInstanceBuilder
      .withAtId('https://repo.metadatacenter.org/template-instances/f38b5ef4-a078-4d82-90c0-a9a721ad5999')
      .withSchemaName(null)
      .withSchemaDescription(null)
      .withSchemaIsBasedOn('https://repo.metadatacenter.org/templates/f38b5ef4-a078-4d82-90c0-a9a721ad5888')
      .withDataId(null)
      .build();

    expect(templateInstance.schema_name).toBeNull();
    expect(templateInstance.schema_description).toBeNull();
    expect(templateInstance.dataContainer.id).toBeNull();
  });
});
