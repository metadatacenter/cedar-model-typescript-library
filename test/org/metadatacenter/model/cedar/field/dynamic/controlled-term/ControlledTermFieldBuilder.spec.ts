import {
  BioportalTermType,
  CedarBuilders,
  CedarJsonWriters,
  CedarWriters,
  ChildDeploymentInfoBuilder,
  ControlledTermBranchBuilder,
  ControlledTermClassBuilder,
  ControlledTermDefaultValueBuilder,
  ControlledTermField,
  ControlledTermFieldBuilder,
  ControlledTermOntologyBuilder,
  ControlledTermValueSetBuilder,
  Iri,
  IsoDate,
  JsonTemplateElementWriter,
  SchemaVersion,
  TemplateElement,
  TemplateElementBuilder,
} from '../../../../../../../../src';

describe('ControlledTermFieldBuilder', () => {
  test('creates controlled field with builder', () => {
    const builder: ControlledTermFieldBuilder = CedarBuilders.controlledTermFieldBuilder();
    const now = IsoDate.now();

    const field: ControlledTermField = builder
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
      .withSchemaName('Schema name of this field')
      .withSchemaDescription('Schema description of the field')
      .withPreferredLabel('Preferred label')
      .withAlternateLabels(['Alt label 1', 'Alt label 2', 'Alt label 3'])
      .withValueRecommendationEnabled(true)
      .withDefaultValue(
        new ControlledTermDefaultValueBuilder()
          .withTermUri(new Iri('http://purl.bioontology.org/ontology/MESH/C039047'))
          .withRdfsLabel('2,3,6-trichlorotoluene')
          .build(),
      )
      .addBranch(
        new ControlledTermBranchBuilder()
          .withAcronym('MESH')
          .withUri(new Iri('http://purl.bioontology.org/ontology/MESH/D055641'))
          .withName('Mathematical Concepts')
          .withSource('Medical Subject Headings (MESH)')
          .withMaxDepth(0)
          .build(),
      )
      .addClass(
        new ControlledTermClassBuilder()
          .withLabel('Music UI Label added in the editor')
          .withPrefLabel('Music')
          .withSource('MESH')
          .withType(BioportalTermType.ONTOLOGY_CLASS)
          .withUri(new Iri('http://purl.bioontology.org/ontology/MESH/D009146'))
          .build(),
      )
      .addOntology(
        new ControlledTermOntologyBuilder()
          .withAcronym('MESH')
          .withName('Medical Subject Headings')
          .withNumTerms(353825)
          .withUri(new Iri('https://data.bioontology.org/ontologies/MESH'))
          .build(),
      )
      .addValueSet(
        new ControlledTermValueSetBuilder()
          .withName('Progressive Disease')
          .withNumTerms(0)
          .withUri(new Iri('https://cadsr.nci.nih.gov/metadata/CADSR-VS/ad5886076616ec6c35558648aca5abf942d6147a'))
          .withVsCollection('CADSR-VS')
          .build(),
      )
      .build();

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const jsonWriter = writers.getFieldWriterForField(field);

    const stringified = jsonWriter.getAsJsonString(field);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['@id']).toBe('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf');
    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/TemplateField');
    expect(backparsed['type']).toBe('object');
    expect(backparsed['title']).toBe('Text field title');
    expect(backparsed['description']).toBe('Text field description');

    expect(backparsed['_ui']).not.toBeNull();
    expect(backparsed['_ui']['inputType']).toBe('textfield');
    expect(backparsed['_ui']['valueRecommendationEnabled']).toBe(true);

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['required']).not.toBeNull();

    expect(backparsed['schema:name']).toBe('Schema name of this field');
    expect(backparsed['schema:description']).toBe('Schema description of the field');

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

    expect(backparsed['_valueConstraints']['requiredValue']).toBe(false);
    expect(backparsed['_valueConstraints']['multipleChoice']).toBeUndefined();
    expect(backparsed['_valueConstraints']['defaultValue']).toStrictEqual({
      termUri: 'http://purl.bioontology.org/ontology/MESH/C039047',
      'rdfs:label': '2,3,6-trichlorotoluene',
    });
    expect(backparsed['_valueConstraints']['branches']).toStrictEqual([
      {
        source: 'Medical Subject Headings (MESH)',
        acronym: 'MESH',
        uri: 'http://purl.bioontology.org/ontology/MESH/D055641',
        name: 'Mathematical Concepts',
        maxDepth: 0,
      },
    ]);
    expect(backparsed['_valueConstraints']['classes']).toStrictEqual([
      {
        uri: 'http://purl.bioontology.org/ontology/MESH/D009146',
        prefLabel: 'Music',
        type: 'OntologyClass',
        label: 'Music UI Label added in the editor',
        source: 'MESH',
      },
    ]);
    expect(backparsed['_valueConstraints']['ontologies']).toStrictEqual([
      {
        numTerms: 353825,
        acronym: 'MESH',
        name: 'Medical Subject Headings',
        uri: 'https://data.bioontology.org/ontologies/MESH',
      },
    ]);
    expect(backparsed['_valueConstraints']['valueSets']).toStrictEqual([
      {
        name: 'Progressive Disease',
        vsCollection: 'CADSR-VS',
        uri: 'https://cadsr.nci.nih.gov/metadata/CADSR-VS/ad5886076616ec6c35558648aca5abf942d6147a',
        numTerms: 0,
      },
    ]);
  });

  test('creates element with one controlled field, single-instance', () => {
    const controlledTermFieldBuilder: ControlledTermFieldBuilder = CedarBuilders.controlledTermFieldBuilder();
    const controlledTermField: ControlledTermField = controlledTermFieldBuilder.withTitle('Controlled Term field').build();

    const controlledTermFieldDeploymentBuilder: ChildDeploymentInfoBuilder =
      controlledTermField.createDeploymentBuilder('controlled_field');

    const controlledTermFieldDeployment = controlledTermFieldDeploymentBuilder
      .withIri('https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde')
      .build();

    const templateElementBuilder: TemplateElementBuilder = CedarBuilders.templateElementBuilder();
    const templateElement: TemplateElement = templateElementBuilder.addChild(controlledTermField, controlledTermFieldDeployment).build();

    // console.log(TestUtil.d(templateElement.getChildrenInfo().children));

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();
    //
    const stringified = JSON.stringify(writer.getAsJsonNode(templateElement), null, 2);
    // console.log(stringified);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['properties']['controlled_field']).not.toBeNull();
    expect(backparsed['properties']['controlled_field']['type']).toBe('object');
    expect(backparsed['properties']['controlled_field']['items']).toBeUndefined();
  });

  test('creates element with one controlled field, multi-instance', () => {
    const controlledTermFieldBuilder: ControlledTermFieldBuilder = CedarBuilders.controlledTermFieldBuilder();
    const controlledTermField: ControlledTermField = controlledTermFieldBuilder.withTitle('Controlled Term field').build();

    const controlledTermFieldDeploymentBuilder: ChildDeploymentInfoBuilder =
      controlledTermField.createDeploymentBuilder('controlled_field');

    const controlledTermFieldDeployment = controlledTermFieldDeploymentBuilder
      .withIri('https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde')
      .withMultiInstance(true)
      .withMinItems(2)
      .withMaxItems(10)
      .build();

    const templateElementBuilder: TemplateElementBuilder = CedarBuilders.templateElementBuilder();
    const templateElement: TemplateElement = templateElementBuilder.addChild(controlledTermField, controlledTermFieldDeployment).build();

    // console.log(TestUtil.d(templateElement.getChildrenInfo().children));

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();
    //
    const stringified = JSON.stringify(writer.getAsJsonNode(templateElement), null, 2);
    // console.log(stringified);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['properties']['controlled_field']).not.toBeNull();
    expect(backparsed['properties']['controlled_field']['type']).toBe('array');
    expect(backparsed['properties']['controlled_field']['minItems']).toBe(2);
    expect(backparsed['properties']['controlled_field']['maxItems']).toBe(10);
    expect(backparsed['properties']['controlled_field']['items']).not.toBeNull();
  });
});
