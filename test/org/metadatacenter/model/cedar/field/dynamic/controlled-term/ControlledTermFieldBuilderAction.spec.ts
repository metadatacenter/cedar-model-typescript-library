import {
  BioportalTermType,
  CedarBuilders,
  CedarJsonWriters,
  CedarWriters,
  ControlledTermActionBuilder,
  ControlledTermField,
  ControlledTermFieldBuilder,
  ControlledTermOntologyBuilder,
  Iri,
} from '../../../../../../../../src';

/**
 * Value-constraint actions on a controlled term field.
 *
 * The model, the action builder, and the JSON and YAML writers already carried
 * actions; only the attachment point on ControlledTermFieldBuilder was missing,
 * so an action could be constructed but never placed on a field. These tests
 * pin the attachment and its serialization.
 *
 * Actions are used in practice: ADVANCETemplate carries sixteen of them, and
 * nine further HuBMAP templates carry one each.
 */
describe('ControlledTermFieldBuilder actions', () => {
  const ontology = () =>
    new ControlledTermOntologyBuilder()
      .withAcronym('MESH')
      .withName('Medical Subject Headings')
      .withNumTerms(353825)
      .withUri(new Iri('https://data.bioontology.org/ontologies/MESH'))
      .build();

  const moveAction = () =>
    new ControlledTermActionBuilder()
      .withAction('move')
      .withTo(0)
      .withTermUri(new Iri('http://purl.bioontology.org/ontology/MESH/D009146'))
      .withSourceUri(new Iri('https://data.bioontology.org/ontologies/MESH'))
      .withSource('MESH')
      .withType(BioportalTermType.ONTOLOGY_CLASS)
      .build();

  const deleteAction = () =>
    new ControlledTermActionBuilder()
      .withAction('delete')
      .withTermUri(new Iri('http://purl.bioontology.org/ontology/MESH/D055641'))
      .withSourceUri(new Iri('https://data.bioontology.org/ontologies/MESH'))
      .withSource('MESH')
      .withType(BioportalTermType.ONTOLOGY_CLASS)
      .build();

  const writeField = (field: ControlledTermField) => {
    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    return JSON.parse(writers.getFieldWriterForField(field).getAsJsonString(field));
  };

  test('attaches a single action and serializes it', () => {
    const builder: ControlledTermFieldBuilder = CedarBuilders.controlledTermFieldBuilder();
    const field: ControlledTermField = builder
      .withTitle('Controlled field with an action')
      .addOntology(ontology())
      .addAction(moveAction())
      .build();

    const backparsed = writeField(field);

    expect(backparsed['_valueConstraints']['actions']).toStrictEqual([
      {
        to: 0,
        action: 'move',
        termUri: 'http://purl.bioontology.org/ontology/MESH/D009146',
        sourceUri: 'https://data.bioontology.org/ontologies/MESH',
        source: 'MESH',
        type: 'OntologyClass',
      },
    ]);
  });

  test('preserves order and multiplicity across several actions', () => {
    const builder: ControlledTermFieldBuilder = CedarBuilders.controlledTermFieldBuilder();
    const field: ControlledTermField = builder
      .withTitle('Controlled field with two actions')
      .addOntology(ontology())
      .addAction(moveAction())
      .addAction(deleteAction())
      .build();

    const actions = writeField(field)['_valueConstraints']['actions'];

    expect(actions).toHaveLength(2);
    expect(actions[0]['action']).toBe('move');
    expect(actions[1]['action']).toBe('delete');
  });

  test('omits actions entirely when none were added', () => {
    const builder: ControlledTermFieldBuilder = CedarBuilders.controlledTermFieldBuilder();
    const field: ControlledTermField = builder.withTitle('Controlled field, no actions').addOntology(ontology()).build();

    const constraints = writeField(field)['_valueConstraints'];

    // An empty action list must not surface as `actions: []` — that would be a
    // gratuitous diff against every template that has never had one.
    expect(constraints['actions']).toBeUndefined();
  });

  test('addAction is chainable alongside the other constraint kinds', () => {
    const builder: ControlledTermFieldBuilder = CedarBuilders.controlledTermFieldBuilder();
    const field: ControlledTermField = builder
      .withTitle('Chained')
      .addOntology(ontology())
      .addAction(moveAction())
      .addOntology(ontology())
      .build();

    const constraints = writeField(field)['_valueConstraints'];

    expect(constraints['ontologies']).toHaveLength(2);
    expect(constraints['actions']).toHaveLength(1);
  });
});
