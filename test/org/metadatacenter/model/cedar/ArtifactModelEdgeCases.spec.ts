import {
  CedarArtifactId,
  CedarBuilders,
  CedarUser,
  IsoDate,
  PavVersion,
  SchemaVersion,
  TemplateElement,
  TextField,
} from '../../../../../src';

describe('artifact model edge cases', () => {
  test('builders accept wrapped provenance values and append alternate labels', () => {
    const createdOn = IsoDate.forValue('2024-03-12T10:03:57Z');
    const user = CedarUser.forValue('https://example.org/users/1');
    const field = CedarBuilders.textFieldBuilder()
      .withAtId(CedarArtifactId.forValue('https://example.org/fields/1'))
      .withCreatedOn(createdOn)
      .withCreatedBy(user)
      .withLastUpdatedOn(createdOn)
      .withModifiedBy(user)
      .withVersion(PavVersion.forValue('1.2.3'))
      .withSchemaVersion(SchemaVersion.CURRENT)
      .addAlternateLabel('first')
      .addAlternateLabel('second')
      .build();

    expect(field.pav_createdOn).toBe(createdOn);
    expect(field.pav_createdBy).toBe(user);
    expect(field.pav_lastUpdatedOn).toBe(createdOn);
    expect(field.oslc_modifiedBy).toBe(user);
    expect(field.skos_altLabel).toEqual(['first', 'second']);
  });

  test('containers expose typed child lookup, declared labels, and generated IRIs', () => {
    const field: TextField = CedarBuilders.textFieldBuilder().withSchemaName('Fallback label').build();
    const nested: TemplateElement = CedarBuilders.templateElementBuilder().withSchemaName('Nested element').build();
    const container: TemplateElement = CedarBuilders.templateElementBuilder()
      .addChild(field, field.createDeploymentBuilder('field without iri').build())
      .addChild(nested, nested.createDeploymentBuilder('nested').build())
      .build();

    expect(container.getChild('missing')).toBeNull();
    expect(container.getField('field without iri')).toBe(field);
    expect(container.getElement('field without iri')).toBeNull();
    expect(container.getElement('nested')).toBe(nested);
    expect(container.getField('nested')).toBeNull();
    // Empty: neither child was given a label by this container, and a child's own name is not one.
    expect(container.getChildrenInfo().getPropertyLabelMap(container)).toEqual({});
    const labelled = CedarBuilders.templateElementBuilder()
      .addChild(field, field.createDeploymentBuilder('field without iri').withLabel('As the parent asks for it').build())
      .build();
    expect(labelled.getChildrenInfo().getPropertyLabelMap(labelled)).toEqual({
      'field without iri': 'As the parent asks for it',
    });
    expect(container.getChildrenInfo().getChildIriMap()['field without iri']).toBe(
      'https://schema.metadatacenter.org/properties/field%20without%20iri',
    );
    expect(container.getChildrenInfo().getOnlyElementNamesForPropertiesContextRequired()).toEqual(['nested']);
  });

  test('attribute-value children enable open instance properties', () => {
    const attributeValue = CedarBuilders.attributeValueFieldBuilder().build();
    const container = CedarBuilders.templateElementBuilder()
      .addChild(attributeValue, attributeValue.createDeploymentBuilder('attributes').build())
      .build();

    expect(container.getChildrenInfo().hasAttributeValue()).toBe(true);
    expect(container.getAdditionalProperties().getValue()).toBe('allow-attribute-value');
    expect(container.getChildrenInfo().getChildrenNamesForRequired()).toEqual([]);
  });
});
