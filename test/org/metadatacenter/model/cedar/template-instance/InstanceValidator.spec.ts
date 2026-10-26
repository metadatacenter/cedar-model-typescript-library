import {
  CedarBuilders,
  CedarReaders,
  CedarWriters,
  InstanceValidator,
  TemplateValueValidator,
  NumberType,
  TemporalGranularity,
  TemporalType,
} from '../../../../../../src';

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
  .withTemporalGranularity(TemporalGranularity.DAY)
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

/** The standard prefixes and term definitions every instance's @context carries. */
const CONTEXT = {
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  pav: 'http://purl.org/pav/',
  schema: 'http://schema.org/',
  oslc: 'http://open-services.net/ns/core#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  'rdfs:label': { '@type': 'xsd:string' },
  'schema:isBasedOn': { '@type': '@id' },
  'schema:name': { '@type': 'xsd:string' },
  'schema:description': { '@type': 'xsd:string' },
  'pav:derivedFrom': { '@type': '@id' },
  'pav:createdOn': { '@type': 'xsd:dateTime' },
  'pav:createdBy': { '@type': '@id' },
  'pav:lastUpdatedOn': { '@type': 'xsd:dateTime' },
  'oslc:modifiedBy': { '@type': '@id' },
  'skos:notation': { '@type': 'xsd:string' },
};

/** The element's own `@context`, which marks `_addr` as an element value. */
const ADDR_CONTEXT = { _city: 'https://schema.metadatacenter.org/properties/city' };

/** The property IRI each child of the template above maps to, as `dep` gives it. */
const PROPERTIES = Object.fromEntries(
  ['_note', '_when', '_count', '_tags', '_addr'].map((name) => [name, `https://schema.metadatacenter.org/properties/${name.slice(1)}`]),
);

/** A complete, correct instance of the template above. */
const complete = () => ({
  '@id': 'https://repo.metadatacenter.org/template-instances/i1',
  '@context': { ...CONTEXT, ...PROPERTIES },
  'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/t1',
  'schema:name': 'An instance',
  'schema:description': '',
  _note: { '@value': 'a note' },
  _when: { '@value': '2020-01-01', '@type': 'xsd:date' },
  _count: { '@value': '3', '@type': 'xsd:int' },
  _tags: [{ '@value': 'a' }, { '@value': 'b' }],
  _addr: { '@context': ADDR_CONTEXT, _city: { '@value': 'Palo Alto' } },
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

test('an undeclared field cannot bypass the template structure', () => {
  const report = check({ ...complete(), extra: { '@value': 'undeclared' } }).getValidationReport();
  expect(report.canSave).toBe(false);
  expect(report.findings).toContainEqual(expect.objectContaining({ path: '/extra', category: 'structural' }));
});

test('an invalid imported default cannot throw away an instance validation report', () => {
  const field = CedarBuilders.numericFieldBuilder().withSchemaName('Count').withNumberType(NumberType.INT).withMaxValue(10).build();
  field.valueConstraints.defaultValue = 99;
  const definition = CedarBuilders.templateBuilder().withSchemaName('T').addChild(field, dep(field, '_count')).build();
  const instance = CedarReaders.json()
    .getFebruary2024()
    .getTemplateInstanceReader()
    .readFromObject({ ...complete(), _count: { '@value': '12', '@type': 'xsd:int' } } as any, undefined as never).instance;
  expect(InstanceValidator.validateReport(instance, definition).findings).toContainEqual(
    expect.objectContaining({ code: 'maxValue', path: '/_count/@value' }),
  );
  expect(field.valueConstraints.defaultValue).toBe(99);
  expect(TemplateValueValidator.validate(definition).findings).toContainEqual(
    expect.objectContaining({ code: 'maxValue', path: '/properties/_count/_valueConstraints/defaultValue' }),
  );
  expect(TemplateValueValidator.validate(definition).canSave).toBe(false);
});

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
      _when: { '@value': null, '@type': 'xsd:date' },
      _count: { '@value': null, '@type': 'xsd:int' },
      _tags: [{ '@value': null }, { '@value': null }],
      _addr: { '@context': ADDR_CONTEXT, _city: { '@value': null } },
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
    expect(errorsOf({ ...complete(), _when: { '@value': null, '@type': 'xsd:date' } })).toStrictEqual([]);
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

  it('requires the null @value property even when a literal is unfilled', () => {
    const report = check({ ...complete(), _note: {} }).getValidationReport();
    expect(report.canSave).toBe(false);
    expect(report.findings).toContainEqual(expect.objectContaining({ code: 'missingProperty', path: '/_note/@value' }));
  });

  it('rejects an IRI atom in a literal field', () => {
    const report = check({ ...complete(), _note: { '@id': 'https://example.org/a' } }).getValidationReport();
    expect(report.canSave).toBe(false);
    expect(report.findings).toContainEqual(expect.objectContaining({ code: 'missingProperty', path: '/_note/@value' }));
  });

  it('reports a null @id inside a list, at its index', () => {
    const errors = errorsOf({ ...complete(), _tags: [{ '@value': 'a' }, { '@id': null }] });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('@id');
    expect(errors[0]).toContain('1');
  });

  it('reports a null @id inside an element', () => {
    const errors = errorsOf({ ...complete(), _addr: { '@context': ADDR_CONTEXT, _city: { '@id': null } } });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('_city');
  });
});

describe('an unfilled controlled term', () => {
  /**
   * A controlled-term value without `@id` is unfilled, whatever else it holds.
   * Stored instances write one as a null or empty label, or as the class alone
   * in `@type`, and the Java validator accepts each: only a label without the
   * IRI of the term it names is refused. The reader keeps what such a value
   * held, and the validator judges that rather than refusing it as an
   * unrecognized shape.
   */
  const CLASS = 'https://example.org/classes/Term';
  const term = CedarBuilders.controlledTermFieldBuilder()
    .withAtId('https://repo.metadatacenter.org/template-fields/term')
    .withSchemaName('term')
    .withSchemaDescription('term')
    .build();
  const withTerm = CedarBuilders.templateBuilder()
    .withAtId('https://repo.metadatacenter.org/templates/t2')
    .withSchemaName('T')
    .withSchemaDescription('T')
    .addChild(term, dep(term, '_term'))
    .build();
  const judge = (value: object) =>
    InstanceValidator.validateReport(
      CedarReaders.json()
        .getFebruary2024()
        .getTemplateInstanceReader()
        .readFromObject(
          {
            '@id': 'https://repo.metadatacenter.org/template-instances/i2',
            '@context': { ...CONTEXT },
            'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/t2',
            'schema:name': 'An instance',
            'schema:description': '',
            _term: value,
          } as any,
          undefined as never,
        ).instance,
      withTerm,
    );

  it.each([{}, { 'rdfs:label': null }, { 'rdfs:label': '' }, { '@type': CLASS }, { '@type': CLASS, 'rdfs:label': null }])(
    'saves %j',
    (value) => {
      expect(judge(value).canSave).toBe(true);
    },
  );

  it('refuses a label without the IRI of its term', () => {
    const report = judge({ '@type': CLASS, 'rdfs:label': 'A term' });
    expect(report.canSave).toBe(false);
    expect(report.findings).toContainEqual(expect.objectContaining({ code: 'controlledStructure', path: '/_term' }));
  });

  it.each([{ '@value': null }, { 'rdfs:label': null, 'skos:prefLabel': 'A term' }])(
    'refuses a key the field does not declare in %j',
    (value) => {
      const report = judge(value);
      expect(report.canSave).toBe(false);
      expect(report.findings).toContainEqual(expect.objectContaining({ code: 'valueShape' }));
    },
  );
});

describe('judged against the stored template', () => {
  /**
   * The server judges an instance against the template document as it is
   * stored, and older templates state three things differently from how the
   * model writes them: a container's `required` can omit a child, a field's can
   * omit `@type`, and a container's `additionalProperties` can admit further
   * literal values. Given the stored document, the validator takes those facts
   * from it.
   */
  const written = () => CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(template) as any;
  const judge = (source: object, stored: object) =>
    InstanceValidator.validateReport(
      CedarReaders.json()
        .getFebruary2024()
        .getTemplateInstanceReader()
        .readFromObject(source as any, undefined as never).instance,
      template,
      stored as any,
    );

  it('lets a child be absent where the stored template does not require it', () => {
    const { _note, ...withoutNote } = complete();
    const required = judge(withoutNote, written());
    expect(required.canSave).toBe(false);
    expect(required.findings).toContainEqual(
      expect.objectContaining({ code: 'missingProperty', path: '/_note', message: 'The template requires this property.' }),
    );
    const stored = written();
    stored.required = stored.required.filter((name: string) => name !== '_note');
    expect(judge(withoutNote, stored).canSave).toBe(true);
  });

  it('lets a date be unfilled without @type where the stored field requires only @value', () => {
    const unfilled = { ...complete(), _when: { '@value': null } };
    expect(judge(unfilled, written()).canSave).toBe(false);
    const stored = written();
    stored.properties._when.required = ['@value'];
    expect(judge(unfilled, stored).canSave).toBe(true);
    expect(judge({ ...complete(), _when: { '@value': '2020-01-01' } }, stored).canSave).toBe(false);
  });

  it("holds each property IRI to the stored template's @context", () => {
    expect(judge(complete(), written()).canSave).toBe(true);
    const remapped = { ...complete(), '@context': { ...complete()['@context'], _note: 'https://example.org/properties/other' } };
    expect(judge(remapped, written()).findings).toContainEqual(
      expect.objectContaining({ code: 'valueShape', path: '/@context/_note', category: 'structural' }),
    );
    const extra = { ...complete(), '@context': { ...complete()['@context'], _gone: 'https://example.org/properties/gone' } };
    expect(judge(extra, written()).canSave).toBe(false);
    const unmapped: Record<string, unknown> = { ...complete()['@context'] };
    delete unmapped._note;
    expect(judge({ ...complete(), '@context': unmapped }, written()).findings).toContainEqual(
      expect.objectContaining({ code: 'missingProperty', path: '/@context/_note' }),
    );
    const element = {
      ...complete(),
      _addr: { '@context': { _city: 'https://example.org/properties/other' }, _city: { '@value': 'Palo Alto' } },
    };
    expect(judge(element, written()).findings).toContainEqual(expect.objectContaining({ path: '/_addr/@context/_city' }));
  });

  it('leaves the child mappings to a writer that takes them from the template, and judges the rest', () => {
    const options = { asWritten: true };
    const mapped = (context: object) =>
      InstanceValidator.validateReport(
        CedarReaders.json()
          .getFebruary2024()
          .getTemplateInstanceReader()
          .readFromObject({ ...complete(), '@context': context } as any, undefined as never).instance,
        template,
        written(),
        options,
      );
    const unmapped: Record<string, unknown> = { ...complete()['@context'] };
    delete unmapped._note;
    expect(mapped(unmapped).canSave).toBe(true);
    expect(mapped({ ...complete()['@context'], _note: 'https://example.org/properties/other' }).canSave).toBe(true);
    expect(mapped({ ...complete()['@context'], _gone: 'https://example.org/properties/gone' }).findings).toContainEqual(
      expect.objectContaining({ code: 'valueShape', path: '/@context/_gone' }),
    );
  });

  it('tells a label stored as null from one left out, where the stored field requires it', () => {
    const stored = written();
    stored.properties._note.required = ['@value', 'rdfs:label'];
    expect(judge({ ...complete(), _note: { '@value': 'a note', 'rdfs:label': null } }, stored).canSave).toBe(true);
    expect(judge(complete(), stored).findings).toContainEqual(expect.objectContaining({ path: '/_note/rdfs:label' }));
  });

  it("holds the stored @context's standard terms to the template, and leaves them to the writer as written", () => {
    const unprefixed: Record<string, unknown> = { ...complete()['@context'] };
    delete unprefixed.xsd;
    const source = { ...complete(), '@context': unprefixed };
    expect(judge(source, written()).findings).toContainEqual(expect.objectContaining({ code: 'missingProperty', path: '/@context/xsd' }));
    const misprefixed = { ...complete(), '@context': { ...complete()['@context'], xsd: 'https://example.org/xsd#' } };
    expect(judge(misprefixed, written()).canSave).toBe(false);
    const instance = CedarReaders.json()
      .getFebruary2024()
      .getTemplateInstanceReader()
      .readFromObject(source as any, undefined as never).instance;
    expect(InstanceValidator.validateReport(instance, template, written(), { asWritten: true }).canSave).toBe(true);
  });

  it('admits an undeclared literal where the stored container admits further literals', () => {
    const extra = { ...complete(), _extra: { '@value': 'more' } };
    expect(judge(extra, written()).canSave).toBe(false);
    const stored = {
      ...written(),
      additionalProperties: {
        type: 'object',
        properties: { '@value': { type: ['string', 'null'] } },
        required: ['@value'],
        additionalProperties: false,
      },
    };
    expect(judge(extra, stored).canSave).toBe(true);
    expect(judge({ ...complete(), _extra: { '@id': 'https://example.org/a' } }, stored).canSave).toBe(false);
  });
});

describe('judged as a verbatim write stores it', () => {
  /**
   * An editor's save leaves the instance's identity, its provenance and each
   * element occurrence's @id to the host and the server. A verbatim write
   * stores the document as it stands, so `verbatim` holds those to the stored
   * template too, as the server does.
   */
  const written = () => CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(template) as any;
  const stamped = (): any => ({
    ...complete(),
    'pav:createdOn': '2026-01-01T00:00:00-08:00',
    'pav:createdBy': 'https://metadatacenter.org/users/u1',
    'pav:lastUpdatedOn': '2026-01-01T00:00:00-0800',
    'oslc:modifiedBy': 'https://metadatacenter.org/users/u1',
    _addr: {
      '@id': 'https://repo.metadatacenter.org/template-element-instances/e1',
      '@context': ADDR_CONTEXT,
      _city: { '@value': 'Palo Alto' },
    },
  });
  const judge = (source: object, verbatim: boolean) =>
    InstanceValidator.validateReport(
      CedarReaders.json()
        .getFebruary2024()
        .getTemplateInstanceReader()
        .readFromObject(source as any, undefined as never).instance,
      template,
      written(),
      { verbatim },
    );
  const without = (key: string) => {
    const document = stamped();
    delete document[key];
    return document;
  };

  it('stores a complete document', () => {
    expect(judge(stamped(), true).canSave).toBe(true);
  });

  it('refuses an element occurrence without its @id, which an editor leaves to the server', () => {
    const document = stamped();
    delete document._addr['@id'];
    expect(judge(document, false).canSave).toBe(true);
    expect(judge(document, true).canSave).toBe(false);
    expect(judge({ ...document, _addr: { ...document._addr, '@id': '' } }, true).canSave).toBe(false);
  });

  it("holds an element occurrence's null @id to what the stored template admits", () => {
    const document = stamped();
    document._addr['@id'] = null;
    const stored = written();
    expect(judge(document, true).canSave).toBe(stored.properties._addr.properties['@id'].type.includes('null'));
  });

  it("refuses a document without its own identity or provenance, and admits the draft's null identity", () => {
    for (const key of ['@id', 'schema:isBasedOn', 'schema:name', 'pav:createdOn', 'oslc:modifiedBy']) {
      expect(judge(without(key), false).canSave).toBe(true);
      expect(judge(without(key), true).canSave).toBe(false);
    }
    expect(judge({ ...stamped(), '@id': null }, true).canSave).toBe(true);
  });

  it('holds those keys to the values the stored template admits', () => {
    expect(judge({ ...stamped(), 'schema:name': '' }, true).canSave).toBe(false);
    expect(judge({ ...stamped(), 'pav:createdOn': null }, true).canSave).toBe(true);
  });
});

describe('a static field', () => {
  /**
   * A static field presents content and takes no answer. The Java validator
   * judges its slot by the schema alone, which declares no property, so `{}`
   * is the only slot it holds.
   */
  const section = CedarBuilders.sectionBreakFieldBuilder()
    .withAtId('https://repo.metadatacenter.org/template-fields/section')
    .withSchemaName('section')
    .withSchemaDescription('section')
    .build();
  const withSection = CedarBuilders.templateBuilder()
    .withAtId('https://repo.metadatacenter.org/templates/t3')
    .withSchemaName('T')
    .withSchemaDescription('T')
    .addChild(note, dep(note, '_note'))
    .addChild(section, section.createDeploymentBuilder('_section').build())
    .build();
  const judge = (slot: object) =>
    InstanceValidator.validateReport(
      CedarReaders.json()
        .getFebruary2024()
        .getTemplateInstanceReader()
        .readFromObject(
          {
            '@id': 'https://repo.metadatacenter.org/template-instances/i3',
            '@context': { ...CONTEXT },
            'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/t3',
            'schema:name': 'An instance',
            'schema:description': '',
            _note: { '@value': 'a note' },
            _section: slot,
          } as any,
          undefined as never,
        ).instance,
      withSection,
    );

  it('holds an empty slot', () => {
    expect(judge({}).canSave).toBe(true);
  });

  it('refuses any property, an unanswered @value included', () => {
    expect(judge({ '@value': null }).canSave).toBe(false);
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
    const report = check({ ...complete(), _tags: [{ '@value': 'a' }] }).getValidationReport();
    expect(report.canSave).toBe(true);
    expect(report.isValid).toBe(false);
    expect(report.findings).toContainEqual(expect.objectContaining({ code: 'minItems', category: 'completeness' }));
  });

  it('reports an empty list where minItems demands entries', () => {
    const report = check({ ...complete(), _tags: [] }).getValidationReport();
    expect(report.canSave).toBe(true);
    expect(report.findings.map((f) => f.code)).toContain('minItems');
  });

  it('reports a list longer than maxItems', () => {
    const tags = [{ '@value': 'a' }, { '@value': 'b' }, { '@value': 'c' }, { '@value': 'd' }, { '@value': 'e' }];
    const report = check({ ...complete(), _tags: tags }).getValidationReport();
    expect(report.canSave).toBe(true);
    expect(report.findings).toContainEqual(expect.objectContaining({ code: 'maxItems', category: 'constraint' }));
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
      _dates: { '@context': { _when: 'https://schema.metadatacenter.org/properties/when' }, _when: { '@value': '2020-01-01' } },
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
