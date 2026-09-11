import {
  CedarBuilders,
  CedarWriters,
  ControlledTermDefaultValueBuilder,
  ControlledTermOntologyBuilder,
  Iri,
  JsonTemplateFieldReader,
  NumberType,
  TemplateField,
  TemporalGranularity,
  TemporalType,
  YamlTemplateFieldReader,
} from '../../../../src';

/**
 * Every field type CEDAR defines, and the declared default it accepts.
 *
 * The table below is the whole point of this file. The Java artifact library
 * settles which types take a default and what shape each one is, and it says so
 * in four sealed interfaces whose `permits` clauses cannot be added to by
 * accident — `LiteralDefaultableFieldBuilder`, `IriDefaultableFieldBuilder`,
 * `NumericDefaultableFieldBuilder` and `TemporalDefaultableFieldBuilder`, plus
 * `ControlledTermDefaultableFieldBuilder`. This library has to agree with all
 * five, and a type that quietly drops what an author declares is the failure
 * this file exists to catch: a designer offering a default value box has no way
 * to find out that the value it collects goes nowhere.
 *
 * The table is checked against the Java source itself by
 * `itest/scripts/verify-java-default-value-parity.ts`, which reads those
 * `permits` clauses from the sibling repository. So a restatement here that
 * drifts from Java fails there, and a type this library forgets fails here.
 *
 * `none` is a claim as much as the other four are. An attribute-value field
 * carries no `_valueConstraints` at all in CEDAR's own meta-schema, and a static
 * field shows something rather than collecting it, so neither has anywhere to put
 * a default. A `withDefaultValue` on either would be a method that lies.
 */
type DefaultShape = 'literal' | 'iri' | 'numeric' | 'temporal' | 'controlledTerm' | 'none';

interface TypeUnderTest {
  readonly label: string;
  readonly shape: DefaultShape;
  readonly builder: () => unknown;
}

const TYPES: ReadonlyArray<TypeUnderTest> = [
  { label: 'text', shape: 'literal', builder: () => CedarBuilders.textFieldBuilder() },
  { label: 'paragraph', shape: 'literal', builder: () => CedarBuilders.textAreaBuilder() },
  { label: 'e-mail', shape: 'literal', builder: () => CedarBuilders.emailFieldBuilder() },
  { label: 'phone number', shape: 'literal', builder: () => CedarBuilders.phoneNumberFieldBuilder() },
  { label: 'radio', shape: 'literal', builder: () => CedarBuilders.radioFieldBuilder() },
  { label: 'checkbox', shape: 'literal', builder: () => CedarBuilders.checkboxFieldBuilder() },
  { label: 'single-select list', shape: 'literal', builder: () => CedarBuilders.singleChoiceListFieldBuilder() },
  { label: 'multi-select list', shape: 'literal', builder: () => CedarBuilders.multipleChoiceListFieldBuilder() },

  { label: 'link', shape: 'iri', builder: () => CedarBuilders.linkFieldBuilder() },
  { label: 'ORCID', shape: 'iri', builder: () => CedarBuilders.extOrcidFieldBuilder() },
  { label: 'ROR', shape: 'iri', builder: () => CedarBuilders.extRorFieldBuilder() },
  { label: 'PFAS', shape: 'iri', builder: () => CedarBuilders.extPfasFieldBuilder() },
  { label: 'RRID', shape: 'iri', builder: () => CedarBuilders.extRridFieldBuilder() },
  { label: 'PubMed', shape: 'iri', builder: () => CedarBuilders.extPubmedFieldBuilder() },
  { label: 'NIH grant identifier', shape: 'iri', builder: () => CedarBuilders.extNihGrantIdFieldBuilder() },
  { label: 'DOI', shape: 'iri', builder: () => CedarBuilders.extDoiFieldBuilder() },

  { label: 'numeric', shape: 'numeric', builder: () => CedarBuilders.numericFieldBuilder() },
  { label: 'temporal', shape: 'temporal', builder: () => CedarBuilders.temporalFieldBuilder() },
  { label: 'controlled term', shape: 'controlledTerm', builder: () => CedarBuilders.controlledTermFieldBuilder() },

  { label: 'attribute value', shape: 'none', builder: () => CedarBuilders.attributeValueFieldBuilder() },
  { label: 'static image', shape: 'none', builder: () => CedarBuilders.imageFieldBuilder() },
  { label: 'static rich text', shape: 'none', builder: () => CedarBuilders.richTextFieldBuilder() },
  { label: 'static YouTube video', shape: 'none', builder: () => CedarBuilders.youtubeFieldBuilder() },
  { label: 'static section break', shape: 'none', builder: () => CedarBuilders.sectionBreakFieldBuilder() },
  { label: 'static page break', shape: 'none', builder: () => CedarBuilders.pageBreakFieldBuilder() },
];

/* eslint-disable @typescript-eslint/no-explicit-any */

/** The identity and titles every field needs before it can be written. */
const named = (builder: any): any =>
  builder
    .withAtId('https://repo.metadatacenter.org/template-fields/00000000-0000-0000-0000-000000000000')
    .withTitle('Declared default')
    .withDescription('Exercises declared defaults')
    .withSchemaName('Declared default')
    .withSchemaDescription('Exercises declared defaults');

/** A field of this type carrying a default of the shape its type accepts. */
const withDeclaredDefault = (type: TypeUnderTest): TemplateField => {
  const builder = named(type.builder());
  switch (type.shape) {
    case 'literal':
      return builder.withDefaultValue('Alpha').build();
    case 'iri':
      return builder.withDefaultValue(new Iri('https://example.org/default-identifier')).build();
    case 'numeric':
      return builder.withNumberType(NumberType.DECIMAL).withDefaultValue(42.5).build();
    case 'temporal':
      return builder
        .withTemporalType(TemporalType.DATE)
        .withTemporalGranularity(TemporalGranularity.DAY)
        .withDefaultValue('2026-08-20')
        .build();
    case 'controlledTerm':
      /*
       * With a vocabulary, because a controlled-term field without one is not
       * read back as itself: the artifact says only that its values are IRIs
       * drawn from nowhere, so the reader answers a text field and the term
       * default becomes a string. That decay is the reader behaving correctly,
       * and it is why this case names an ontology.
       */
      return builder
        .addOntology(
          new ControlledTermOntologyBuilder()
            .withUri(new Iri('https://data.bioontology.org/ontologies/DOID'))
            .withAcronym('DOID')
            .withName('Human Disease Ontology')
            .build(),
        )
        .withDefaultValue(
          new ControlledTermDefaultValueBuilder().withTermUri(new Iri('https://example.org/term/1')).withRdfsLabel('Melanoma').build(),
        )
        .build();
    case 'none':
      throw new Error(`${type.label} takes no default`);
  }
};

/** The default as it is declared in the artifact, whatever shape that is. */
const declaredDefaultOf = (field: TemplateField): unknown =>
  (field as unknown as { valueConstraints?: { defaultValue?: unknown } }).valueConstraints?.defaultValue;

/** Two declared defaults are the same default, comparing IRIs and terms by value. */
const sameDefault = (left: unknown, right: unknown): boolean => {
  if (left instanceof Iri && right instanceof Iri) {
    return left.getValue() === right.getValue();
  }
  const term = (value: unknown): { uri: string; label: string } | null => {
    const candidate = value as { termUri?: Iri; rdfsLabel?: string } | null;
    return candidate?.termUri instanceof Iri ? { uri: candidate.termUri.getValue(), label: candidate.rdfsLabel ?? '' } : null;
  };
  const leftTerm = term(left);
  const rightTerm = term(right);
  if (leftTerm !== null && rightTerm !== null) {
    return leftTerm.uri === rightTerm.uri && leftTerm.label === rightTerm.label;
  }
  return left === right;
};

const jsonWriterFor = (field: TemplateField) => CedarWriters.json().getStrict().getFieldWriterForField(field);
const yamlWriterFor = (field: TemplateField) => CedarWriters.yaml().getStrict().getFieldWriterForField(field);

const defaultable = TYPES.filter((type) => type.shape !== 'none');
const notDefaultable = TYPES.filter((type) => type.shape === 'none');

describe('which field types accept a declared default', () => {
  test.each(defaultable.map((type) => [type.label, type] as const))('%s has a default value setter', (_label, type) => {
    expect(typeof (type.builder() as any).withDefaultValue).toBe('function');
  });

  test.each(notDefaultable.map((type) => [type.label, type] as const))('%s has no default value setter', (_label, type) => {
    expect((type.builder() as any).withDefaultValue).toBeUndefined();
  });

  test('every field type the library builds appears in the table', () => {
    /*
     * So that a field type added to the library cannot slip past this file
     * without someone deciding what its default is. Every builder factory is a
     * field type except the three that build containers.
     */
    const containers = ['templateBuilder', 'templateElementBuilder', 'templateInstanceBuilder'];
    const factories = Object.getOwnPropertyNames(CedarBuilders).filter((name) => name.endsWith('Builder') && !containers.includes(name));
    expect(factories.length).toBe(TYPES.length);
  });
});

describe('a declared default survives being written and read', () => {
  test.each(defaultable.map((type) => [type.label, type] as const))('%s keeps its default through JSON', (_label, type) => {
    const original = withDeclaredDefault(type);
    const once = jsonWriterFor(original).getAsJsonString(original);

    const read = JsonTemplateFieldReader.getStrict().readFromString(once).field;
    expect(sameDefault(declaredDefaultOf(read), declaredDefaultOf(original))).toBe(true);
    expect(JSON.parse(jsonWriterFor(read).getAsJsonString(read))).toEqual(JSON.parse(once));
  });

  test.each(defaultable.map((type) => [type.label, type] as const))('%s keeps its default through YAML', (_label, type) => {
    const original = withDeclaredDefault(type);
    const once = yamlWriterFor(original).getAsYamlString(original);

    const read = YamlTemplateFieldReader.getStrict().readFromString(once).field;
    expect(sameDefault(declaredDefaultOf(read), declaredDefaultOf(original))).toBe(true);
    expect(yamlWriterFor(read).getAsYamlString(read)).toBe(once);
  });

  test.each(defaultable.map((type) => [type.label, type] as const))(
    '%s keeps its default across the two serializations',
    (_label, type) => {
      const original = withDeclaredDefault(type);
      const throughYaml = YamlTemplateFieldReader.getStrict().readFromString(yamlWriterFor(original).getAsYamlString(original)).field;

      const before = JSON.parse(jsonWriterFor(original).getAsJsonString(original));
      const after = JSON.parse(jsonWriterFor(throughYaml).getAsJsonString(throughYaml));
      expect(after._valueConstraints).toEqual(before._valueConstraints);
    },
  );

  test.each(defaultable.map((type) => [type.label, type] as const))(
    '%s writes the default into the artifact it is read from',
    (_label, type) => {
      const original = withDeclaredDefault(type);
      const json = JSON.parse(jsonWriterFor(original).getAsJsonString(original));
      const yaml = yamlWriterFor(original).getAsYamlString(original);

      // Present in both serializations, under the one key each of them uses.
      expect(json._valueConstraints.defaultValue).toBeDefined();
      expect(yaml).toContain('default:');
    },
  );
});

describe('an absent default stays absent', () => {
  test.each(defaultable.map((type) => [type.label, type] as const))('%s writes no default when none is declared', (_label, type) => {
    const field = named(type.builder()).build();
    const json = JSON.parse(jsonWriterFor(field).getAsJsonString(field));
    expect(json._valueConstraints?.defaultValue).toBeUndefined();
    expect(yamlWriterFor(field).getAsYamlString(field)).not.toContain('default:');
  });

  test.each(defaultable.filter((type) => type.shape === 'literal').map((type) => [type.label, type] as const))(
    '%s writes no default for an empty one',
    (_label, type) => {
      const field = named(type.builder()).withDefaultValue('').build();
      const json = JSON.parse(jsonWriterFor(field).getAsJsonString(field));
      expect(json._valueConstraints?.defaultValue).toBeUndefined();
      expect(yamlWriterFor(field).getAsYamlString(field)).not.toContain('default:');
    },
  );

  test.each(notDefaultable.map((type) => [type.label, type] as const))('%s carries no default at all', (_label, type) => {
    const field = named(type.builder()).build();
    const json = JSON.parse(jsonWriterFor(field).getAsJsonString(field));
    const constraints = json._valueConstraints ?? json.items?._valueConstraints;
    expect(constraints?.defaultValue).toBeUndefined();
  });
});

describe('the option-borne default of a choice field', () => {
  /*
   * A radio, a checkbox and the two list types say a default twice over: the
   * literal above, and `selectedByDefault` on one of their own options. Both are
   * in CEDAR's schema and both have to survive, because a designer will reach for
   * the option flag — it is the only one of the two that names a value the field
   * actually permits.
   */
  const choiceTypes = [
    ['radio', () => CedarBuilders.radioFieldBuilder(), 'addRadioOption'],
    ['checkbox', () => CedarBuilders.checkboxFieldBuilder(), 'addCheckboxOption'],
    ['single-select list', () => CedarBuilders.singleChoiceListFieldBuilder(), 'addListOption'],
    ['multi-select list', () => CedarBuilders.multipleChoiceListFieldBuilder(), 'addListOption'],
  ] as const;

  test.each(choiceTypes)('%s keeps its selected option through both serializations', (_label, make, addOption) => {
    const builder = named(make()) as any;
    const original = builder[addOption]('Alpha', false)[addOption]('Beta', true).build();

    const literalsOf = (field: TemplateField) =>
      (field as unknown as { valueConstraints: { literals: Array<{ label: string; selectedByDefault: boolean }> } }).valueConstraints
        .literals;

    expect(literalsOf(original).map((literal) => literal.selectedByDefault)).toEqual([false, true]);

    const fromJson = JsonTemplateFieldReader.getStrict().readFromString(jsonWriterFor(original).getAsJsonString(original)).field;
    const fromYaml = YamlTemplateFieldReader.getStrict().readFromString(yamlWriterFor(original).getAsYamlString(original)).field;
    expect(literalsOf(fromJson).map((literal) => literal.selectedByDefault)).toEqual([false, true]);
    expect(literalsOf(fromYaml).map((literal) => literal.selectedByDefault)).toEqual([false, true]);
  });

  test.each(choiceTypes)('%s carries a literal default and a selected option together', (_label, make, addOption) => {
    const builder = named(make()) as any;
    const original = builder.withDefaultValue('Alpha')[addOption]('Alpha', true).build();

    const json = JSON.parse(jsonWriterFor(original).getAsJsonString(original));
    const constraints = json._valueConstraints ?? json.items._valueConstraints;
    expect(constraints.defaultValue).toBe('Alpha');
    expect(constraints.literals).toEqual([{ label: 'Alpha', selectedByDefault: true }]);
  });
});
