import { CedarBuilders, CedarReaders, InstanceValidator, NumberType, TemporalType } from '../../../../../../src';

/**
 * An instance judged against its template.
 *
 * The reader is handed no template, so it takes a document at face value: a
 * value that has lost its `@type`, a list short of its `minItems`, a property
 * the template requires and the document omits all parse without complaint.
 * These are the cases where the template is the only thing that knows.
 *
 * Each `describe` below is a defect shape observed in a real editor, not a
 * hypothetical. The ones about `@type` and `minItems` in particular are the
 * shapes that reached saved documents while every other check stayed green.
 */
const id = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const textField = (name: string) =>
  CedarBuilders.textFieldBuilder()
    .withAtId(`https://repo.metadatacenter.org/template-fields/${id(name)}`)
    .withSchemaName(name)
    .withSchemaDescription(name)
    .build();

const dep = (artifact: any, prop: string) =>
  artifact
    .createDeploymentBuilder(prop)
    .withIri(`https://schema.metadatacenter.org/properties/${prop.slice(1)}`)
    .build();

const multiDep = (artifact: any, prop: string, minItems: number | null, maxItems: number | null) =>
  artifact
    .createDeploymentBuilder(prop)
    .withIri(`https://schema.metadatacenter.org/properties/${prop.slice(1)}`)
    .withMultiInstance(true)
    .withMinItems(minItems)
    .withMaxItems(maxItems)
    .build();

const when = CedarBuilders.temporalFieldBuilder()
  .withAtId('https://repo.metadatacenter.org/template-fields/when')
  .withSchemaName('when')
  .withSchemaDescription('when')
  .withTemporalType(TemporalType.DATE)
  .build();

const count = CedarBuilders.numericFieldBuilder()
  .withAtId('https://repo.metadatacenter.org/template-fields/count')
  .withSchemaName('count')
  .withSchemaDescription('count')
  .withNumberType(NumberType.INT)
  .build();

const note = textField('note');
const tag = textField('tag');
const city = textField('city');

const element = CedarBuilders.templateElementBuilder()
  .withAtId('https://repo.metadatacenter.org/template-elements/addr')
  .withSchemaName('addr')
  .withSchemaDescription('addr')
  .addChild(city, dep(city, '_city'))
  .build();

const template = CedarBuilders.templateBuilder()
  .withAtId('https://repo.metadatacenter.org/templates/t1')
  .withSchemaName('T')
  .withSchemaDescription('T')
  .addChild(note, dep(note, '_note'))
  .addChild(when, dep(when, '_when'))
  .addChild(count, dep(count, '_count'))
  .addChild(tag, multiDep(tag, '_tags', 2, 4))
  .addChild(element, dep(element, '_addr'))
  .build();

const CONTEXT = {
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  pav: 'http://purl.org/pav/',
  schema: 'http://schema.org/',
  oslc: 'http://open-services.net/ns/core#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
};

/** A complete, correct instance of the template above. */
const complete = () => ({
  '@id': 'https://repo.metadatacenter.org/template-instances/i1',
  '@context': { ...CONTEXT },
  'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/t1',
  'schema:name': 'An instance',
  'schema:description': '',
  _note: { '@value': 'a note' },
  _when: { '@value': '2020-01-01', '@type': 'xsd:date' },
  _count: { '@value': '3', '@type': 'xsd:int' },
  _tags: [{ '@value': 'a' }, { '@value': 'b' }],
  _addr: { _city: { '@value': 'Palo Alto' } },
});

const check = (source: object) => {
  const instance = CedarReaders.json()
    .getFebruary2024()
    .getTemplateInstanceReader()
    .readFromObject(source as any, undefined as never).instance;
  return InstanceValidator.validate(instance, template);
};

const errorsOf = (source: object) =>
  check(source)
    .getBlueprintComparisonErrors()
    .map((e) => `${e.errorType.getValue()} at ${JSON.stringify(e.errorPath)}`);

describe('a correct instance', () => {
  it('reports no errors', () => {
    const result = check(complete());
    expect(result.getBlueprintComparisonErrors()).toStrictEqual([]);
  });

  it('adheres to its template', () => {
    expect(check(complete()).adheresToBlueprint()).toBe(true);
  });

  /**
   * The check must not mistake "empty" for "wrong". A property has to be
   * present, but null is a legal value for one — it is how CEDAR says
   * "not filled in" — so an untouched form is valid, not a pile of errors.
   */
  it('accepts empty slots throughout', () => {
    const empty = {
      ...complete(),
      _note: { '@value': null },
      _when: { '@value': null },
      _count: { '@value': null },
      _tags: [{ '@value': null }, { '@value': null }],
      _addr: { _city: { '@value': null } },
    };
    expect(errorsOf(empty)).toStrictEqual([]);
  });
});

describe('a value that lost its @type', () => {
  /**
   * The defect that motivated this. Editing a temporal or numeric field wrote
   * the value back without the `@type` its schema requires. The document stays
   * well formed and the value survives, so nothing short of the template
   * notices.
   */
  it('is reported for a temporal field', () => {
    const errors = errorsOf({ ...complete(), _when: { '@value': '2020-01-01' } });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('missingKeyInRealObject');
  });

  it('is reported for a numeric field', () => {
    const errors = errorsOf({ ...complete(), _count: { '@value': '3' } });
    expect(errors).toHaveLength(1);
  });

  it('names @type as the missing key, and the field as the path', () => {
    const error = check({ ...complete(), _when: { '@value': '2020-01-01' } }).getBlueprintComparisonErrors()[0];
    expect(JSON.stringify(error.errorPath)).toContain('_when');
    expect(JSON.stringify(error.errorPath)).toContain('@type');
    expect(error.expectedValue).toBe('xsd:date');
  });

  it('is not reported when the slot is simply empty', () => {
    expect(errorsOf({ ...complete(), _when: { '@value': null } })).toStrictEqual([]);
  });
});

describe('a value with the wrong @type', () => {
  it('is reported, with both the expected and the encountered type', () => {
    const error = check({
      ...complete(),
      _when: { '@value': '2020-01-01', '@type': 'xsd:dateTime' },
    }).getBlueprintComparisonErrors()[0];
    expect(error.expectedValue).toBe('xsd:date');
    expect(error.encounteredValue).toBe('xsd:dateTime');
  });
});

describe('@value and @id are not symmetrical', () => {
  /**
   * A literal's `@value` may be null — JSON-LD allows it and CEDAR declares the
   * property `["string", "null"]`, which is how an unfilled literal is written.
   * An `@id` may not: JSON-LD requires an IRI and CEDAR declares it
   * `{"type": "string", "format": "uri"}` with no null branch. An unfilled link
   * is written `{}` instead.
   *
   * Nothing else catches the difference. The reader accepts `{"@id": null}` and
   * the writer emits it back unchanged, so a document carrying one survives a
   * round trip intact.
   */
  it('accepts a null @value', () => {
    expect(errorsOf({ ...complete(), _note: { '@value': null } })).toStrictEqual([]);
  });

  it('rejects a null @id', () => {
    const errors = errorsOf({ ...complete(), _note: { '@id': null } });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('missingValueInRealObject');
    expect(errors[0]).toContain('@id');
  });

  it('accepts {} as the way an unfilled link is written', () => {
    expect(errorsOf({ ...complete(), _note: {} })).toStrictEqual([]);
  });

  it('accepts a real IRI', () => {
    expect(errorsOf({ ...complete(), _note: { '@id': 'https://example.org/a' } })).toStrictEqual([]);
  });

  it('reports a null @id inside a list, at its index', () => {
    const errors = errorsOf({ ...complete(), _tags: [{ '@value': 'a' }, { '@id': null }] });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('@id');
    expect(errors[0]).toContain('1');
  });

  it('reports a null @id inside an element', () => {
    const errors = errorsOf({ ...complete(), _addr: { _city: { '@id': null } } });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('_city');
  });
});

describe('a property the template requires', () => {
  /**
   * A template lists every non-static, non-attribute-value child in its JSON
   * Schema `required`. An editor that drops a child from its own tree — because
   * the template marks it hidden, say — emits a document missing a property its
   * own schema demands.
   */
  it('is reported when absent', () => {
    const { _note, ...missing } = complete();
    const errors = errorsOf(missing);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('missingKeyInRealObject');
    expect(errors[0]).toContain('_note');
  });

  it('is reported for each one absent', () => {
    const { _note, _when, ...missing } = complete();
    expect(errorsOf(missing)).toHaveLength(2);
  });
});

describe('cardinality', () => {
  /**
   * A multi field declaring `minItems: n` must hold at least n slots. A choice
   * field that rebuilt its list from defaults, and had none, came out as `[]`
   * against a schema demanding one — invalid the moment it was created.
   */
  it('reports a list shorter than minItems', () => {
    const errors = errorsOf({ ...complete(), _tags: [{ '@value': 'a' }] });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('missingIndexInRealObject');
  });

  it('reports an empty list where minItems demands entries', () => {
    expect(errorsOf({ ...complete(), _tags: [] })).toHaveLength(1);
  });

  it('reports a list longer than maxItems', () => {
    const tags = [{ '@value': 'a' }, { '@value': 'b' }, { '@value': 'c' }, { '@value': 'd' }, { '@value': 'e' }];
    const errors = errorsOf({ ...complete(), _tags: tags });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('unexpectedIndexInRealObject');
  });

  it('accepts a length between the bounds', () => {
    const tags = [{ '@value': 'a' }, { '@value': 'b' }, { '@value': 'c' }];
    expect(errorsOf({ ...complete(), _tags: tags })).toStrictEqual([]);
  });

  it('reports a single value where the template declares a list', () => {
    const errors = errorsOf({ ...complete(), _tags: { '@value': 'a' } });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('valueMismatch');
  });

  it('reports a list where the template declares a single value', () => {
    const errors = errorsOf({ ...complete(), _note: [{ '@value': 'a' }] });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('valueMismatch');
  });
});

describe('nested elements', () => {
  it('reports a missing property inside an element', () => {
    const errors = errorsOf({ ...complete(), _addr: {} });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('_city');
  });

  it('reports a lost @type inside an element', () => {
    const nested = CedarBuilders.templateElementBuilder()
      .withAtId('https://repo.metadatacenter.org/template-elements/dates')
      .withSchemaName('dates')
      .withSchemaDescription('dates')
      .addChild(when, dep(when, '_when'))
      .build();
    const withNested = CedarBuilders.templateBuilder()
      .withAtId('https://repo.metadatacenter.org/templates/t2')
      .withSchemaName('T2')
      .withSchemaDescription('T2')
      .addChild(nested, dep(nested, '_dates'))
      .build();

    const source = {
      '@id': 'https://repo.metadatacenter.org/template-instances/i2',
      '@context': { ...CONTEXT },
      'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/t2',
      'schema:name': 'An instance',
      'schema:description': '',
      _dates: { _when: { '@value': '2020-01-01' } },
    };
    const instance = CedarReaders.json()
      .getFebruary2024()
      .getTemplateInstanceReader()
      .readFromObject(source as any, undefined as never).instance;
    const result = InstanceValidator.validate(instance, withNested);

    expect(result.getBlueprintComparisonErrorCount()).toBe(1);
    expect(JSON.stringify(result.getBlueprintComparisonErrors()[0].errorPath)).toContain('_dates');
  });
});
