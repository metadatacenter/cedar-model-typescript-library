import {
  AbstractSchemaArtifact,
  AnnotationAtId,
  AnnotationAtValue,
  BiboStatus,
  CedarWriters,
  YamlTemplateElementReader,
  YamlTemplateFieldReader,
  YamlTemplateInstanceReader,
  YamlTemplateReader,
} from '../../../../../src';

// What this library refuses, the Java library refuses too: a document in the compact form given to a
// reader that was not asked for it, and a field type it does not know. Both used to be absorbed —
// the first into an artifact with an absent model version, the second into a typeless field that
// reported success and then broke whichever writer was handed it. The unknown types used here are the
// spellings of the boolean field, a type since removed for having no user interface and no way to
// author one.

const fullField = `type: "text-field"
name: "Study Name"
id: "https://repo.metadatacenter.org/template-fields/f1"
modelVersion: "1.6.0"
`;

// The compact form names neither the artifact it describes nor what a repository records about it.
const compactField = `type: "text-field"
name: "Study Name"
`;

const fullTemplate = `type: "template"
name: "Study"
id: "https://repo.metadatacenter.org/templates/t1"
modelVersion: "1.6.0"
version: "0.0.1"
status: "draft"
children:
  - key: "Study Name"
    type: "text-field"
    name: "Study Name"
    modelVersion: "1.6.0"
`;

const compactTemplate = `type: "template"
name: "Study"
children:
  - key: "Study Name"
    type: "text-field"
    name: "Study Name"
`;

describe('reading the compact form has to be asked for', () => {
  test('the ordinary field reader refuses compact input over the absent model version', () => {
    expect(() => YamlTemplateFieldReader.getStrict().readFromString(compactField)).toThrow(/modelVersion/);
    expect(YamlTemplateFieldReader.getStrictForCompact().readFromString(compactField).field.schema_name).toBe('Study Name');
  });

  test('the ordinary template reader refuses it too, and the compact one reads it', () => {
    expect(() => YamlTemplateReader.getStrict().readFromString(compactTemplate)).toThrow(/modelVersion/);
    expect(YamlTemplateReader.getStrictForCompact().readFromString(compactTemplate).template.schema_name).toBe('Study');
  });

  test('a compact child is refused by the ordinary reader as surely as a compact artifact', () => {
    const compactChildInFullTemplate = fullTemplate.replace('    modelVersion: "1.6.0"\n', '');
    expect(() => YamlTemplateReader.getStrict().readFromString(compactChildInFullTemplate)).toThrow(/modelVersion/);
  });

  test('the full form reads with the ordinary reader, and the compact reader accepts it as well', () => {
    expect(YamlTemplateFieldReader.getStrict().readFromString(fullField).field.schema_name).toBe('Study Name');
    expect(YamlTemplateFieldReader.getStrictForCompact().readFromString(fullField).field.schema_name).toBe('Study Name');
    expect(YamlTemplateReader.getStrict().readFromString(fullTemplate).template.schema_name).toBe('Study');
  });

  test('an instance carries no model version in either form, so neither reader asks for one', () => {
    const instance = `type: "instance"
name: "Study metadata"
id: "https://repo.metadatacenter.org/template-instances/i1"
isBasedOn: "https://repo.metadatacenter.org/templates/t1"
children:
  Study Name:
    value: "A study"
`;
    expect(YamlTemplateInstanceReader.getStrict().readFromString(instance).instance.schema_name).toBe('Study metadata');
  });
});

describe("an instance's metadata is held to the Java reader's rules", () => {
  const isBasedOn = 'isBasedOn: "https://repo.metadatacenter.org/templates/t1"\n';
  const children = 'children:\n  Study Name:\n    value: "A study"\n';
  const read = (yaml: string) => YamlTemplateInstanceReader.getStrict().readFromString(yaml);
  const named = (metadata: string) => read(`type: "instance"\nname: "Study metadata"\n${isBasedOn}${metadata}${children}`);

  test.each([
    ['a null name', 'name: null\n', /null is not a valid value at \/name/],
    ['an empty name', 'name: ""\n', /non-empty string at \/name/],
    ['a name that is not a string', 'name: 42\n', /Expected a string at \/name/],
    ['no name', '', /No name present/],
  ])('%s is refused', (_label: string, name: string, refusal: RegExp) => {
    expect(() => read(`type: "instance"\n${name}${isBasedOn}${children}`)).toThrow(refusal);
  });

  test.each([
    ['description', 'description: null\n'],
    ['id', 'id: null\n'],
    ['isBasedOn', 'isBasedOn: null\n'],
    ['derivedFrom', 'derivedFrom: null\n'],
    ['createdBy', 'createdBy: null\n'],
    ['createdOn', 'createdOn: null\n'],
    ['annotations', 'annotations: null\n'],
  ])('a null %s is refused as null, not read as absent', (key: string, metadata: string) => {
    const yaml =
      key === 'isBasedOn'
        ? `type: "instance"\nname: "Study metadata"\n${metadata}${children}`
        : `type: "instance"\nname: "Study metadata"\n${isBasedOn}${metadata}${children}`;
    expect(() => read(yaml)).toThrow(new RegExp(`null is not a valid value at /${key}`));
  });

  test.each([
    ['a number', 'description: 42\n'],
    ['a mapping', 'description:\n  text: "A study"\n'],
  ])('a description that is %s is refused', (_label: string, metadata: string) => {
    expect(() => named(metadata)).toThrow(/Expected a string at \/description/);
  });

  test('an empty annotations block is refused', () => {
    expect(() => named('annotations: {}\n')).toThrow(/empty mapping \(\{\}\) is not a valid value at \/annotations/);
  });

  test('an instance without isBasedOn is refused', () => {
    expect(() => read(`type: "instance"\nname: "Study metadata"\n${children}`)).toThrow(/No isBasedOn present/);
  });

  // A document that does not say it is an instance, or says it is something else, was read as one.
  test.each([
    ['no type', '', /No type present/],
    ['a type that is not a string', 'type: 42\n', /Expected a string at \/type/],
    ['a template type', 'type: "template"\n', /Invalid artifact type "template" at \/type/],
    ['an element instance type', 'type: "element-instance"\n', /Invalid artifact type "element-instance" at \/type/],
  ])('%s is refused', (_label: string, type: string, refusal: RegExp) => {
    expect(() => read(`${type}name: "Study metadata"\n${isBasedOn}${children}`)).toThrow(refusal);
  });

  // Who created or modified an instance is an IRI. The reader kept an empty string or a number as
  // the user, and the JSON writer then wrote it as one.
  test.each([
    ['createdBy', 'an empty string', '""', /An empty string is not a URI at "createdBy"/],
    ['modifiedBy', 'an empty string', '""', /An empty string is not a URI at "modifiedBy"/],
    ['createdBy', 'a number', '42', /Invalid URI at "createdBy": expected a string/],
    ['modifiedBy', 'a number', '42', /Invalid URI at "modifiedBy": expected a string/],
    ['createdBy', 'not an IRI', '"a user"', /Invalid URI\/IRI at "createdBy": unescaped space/],
  ])('a %s that is %s is refused', (key: string, _label: string, value: string, refusal: RegExp) => {
    expect(() => named(`${key}: ${value}\n`)).toThrow(refusal);
  });

  test('a creator and a modifier given as IRIs are read', () => {
    const instance = named(
      'createdBy: "https://metadatacenter.org/users/u1"\nmodifiedBy: "https://metadatacenter.org/users/u2"\n',
    ).instance;
    expect(instance.pav_createdBy.getValue()).toBe('https://metadatacenter.org/users/u1');
    expect(instance.oslc_modifiedBy.getValue()).toBe('https://metadatacenter.org/users/u2');
  });

  // An annotation's literal is a string. A number was kept as a number and written to JSON as one.
  test.each([
    ['a number', '42'],
    ['a boolean', 'true'],
    ['a mapping', '{text: "A note"}'],
  ])('an annotation value that is %s is refused', (_label: string, value: string) => {
    expect(() => named(`annotations:\n  note:\n    value: ${value}\n`)).toThrow(/Expected a string at \/annotations\/note\/value/);
  });

  test('an annotation value written as a quoted number is read as the string', () => {
    const annotation = named('annotations:\n  note:\n    value: "42"\n').instance.annotations?.get('note');
    expect(annotation).toBeInstanceOf(AnnotationAtValue);
    expect((annotation as AnnotationAtValue).getAtValue()).toBe('42');
  });

  // An annotation's IRI is held to the rule of the instance's other identifiers. A number, an empty
  // string and a string that is no IRI were kept and written to JSON as the annotation's @id.
  test.each([
    ['a number', '42', /Invalid URI at "annotations\/note\/id": expected a string/],
    ['an empty string', '""', /An empty string is not a URI at "annotations\/note\/id"/],
    ['not an IRI', '"a note"', /Invalid URI\/IRI at "annotations\/note\/id": unescaped space/],
  ])('an annotation id that is %s is refused', (_label: string, id: string, refusal: RegExp) => {
    expect(() => named(`annotations:\n  note:\n    id: ${id}\n`)).toThrow(refusal);
  });

  test('an annotation that states a literal and an IRI is read as the literal, as Java reads it', () => {
    const annotation = named('annotations:\n  note:\n    value: "A note"\n    id: "https://example.org/note"\n').instance.annotations?.get(
      'note',
    );
    expect(annotation).toBeInstanceOf(AnnotationAtValue);
    expect((annotation as AnnotationAtValue).getAtValue()).toBe('A note');
  });

  // schema:description is never null: the empty string is the only spelling of no description.
  test('an empty or absent description reads as the empty string', () => {
    expect(named('description: ""\n').instance.schema_description).toBe('');
    expect(named('').instance.schema_description).toBe('');
  });
});

describe('compact documents retain artifact identity', () => {
  const named = (yaml: string) => yaml.replace('name: "Study', 'id: "https://repo.metadatacenter.org/x/1"\nname: "Study');

  test('a template, an element and a field keep their identifiers', () => {
    expect(YamlTemplateReader.getStrictForCompact().readFromString(named(compactTemplate)).template.at_id.getValue()).toBe(
      'https://repo.metadatacenter.org/x/1',
    );
    expect(YamlTemplateFieldReader.getStrictForCompact().readFromString(named(compactField)).field.at_id.getValue()).toBe(
      'https://repo.metadatacenter.org/x/1',
    );
    expect(
      YamlTemplateElementReader.getStrictForCompact()
        .readFromString(named(`type: "element"\nname: "Study element"\n`))
        .element.at_id.getValue(),
    ).toBe('https://repo.metadatacenter.org/x/1');
  });

  test('an instance keeps its identifier', () => {
    const instance = `type: "instance"
id: "https://repo.metadatacenter.org/template-instances/i1"
name: "Study metadata"
isBasedOn: "https://repo.metadatacenter.org/templates/t1"
`;
    expect(YamlTemplateInstanceReader.getStrictForCompact().readFromString(instance).instance.at_id.getValue()).toBe(
      'https://repo.metadatacenter.org/template-instances/i1',
    );
    expect(YamlTemplateInstanceReader.getStrict().readFromString(instance).instance.schema_name).toBe('Study metadata');
  });

  test('a child identifier is accepted but omitted from canonical compact output', () => {
    const childWithId = `type: "template"
name: "Study"
children:
  - key: "Study Name"
    type: "text-field"
    name: "Study Name"
    id: "https://repo.metadatacenter.org/template-fields/f1"
`;
    const template = YamlTemplateReader.getStrictForCompact().readFromString(childWithId).template;
    expect(template.getChildrenInfo().getChildIriMap()['Study Name']).toBeUndefined();
    expect(CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(template, true)).not.toContain(
      'id: "https://repo.metadatacenter.org/template-fields/f1"',
    );
  });
});

describe('an unknown field type is refused', () => {
  test.each(['boolean', 'boolean-field'])('the retired boolean field type is refused: %s', (retired: string) => {
    // The boolean field was a model type with no user interface and no way to author one: the
    // embeddable editor had no component for it and the template designer did not offer it. It is
    // gone, under either spelling it once had, and a document carrying one is refused rather than
    // read into a field with no type.
    const old = fullField.replace('type: "text-field"', `type: "${retired}"`);
    expect(() => YamlTemplateFieldReader.getStrict().readFromString(old)).toThrow(new RegExp(`Unknown field type "${retired}"`));
  });

  test('a type that is not a field type at all is refused', () => {
    const nonsense = fullField.replace('type: "text-field"', 'type: "not-a-field"');
    expect(() => YamlTemplateFieldReader.getStrict().readFromString(nonsense)).toThrow(/Unknown field type "not-a-field"/);
  });

  test('an absent type is refused', () => {
    expect(() => YamlTemplateFieldReader.getStrict().readFromString(fullField.replace('type: "text-field"\n', ''))).toThrow(
      /Unknown field type/,
    );
  });

  test('an unknown child type is refused inside a template, and the path says where', () => {
    const foreignChild = fullTemplate.replace('    type: "text-field"', '    type: "boolean"');
    // The container refuses it before the field reader sees it, and names the child.
    expect(() => YamlTemplateReader.getStrict().readFromString(foreignChild)).toThrow(
      /Unknown child type "boolean" at \/children\/Study Name\//,
    );
  });

  test('an element refuses one as well', () => {
    const element = `type: "element"
name: "Address"
id: "https://repo.metadatacenter.org/template-elements/e1"
modelVersion: "1.6.0"
children:
  - key: "City"
    type: "boolean"
    name: "City"
    modelVersion: "1.6.0"
`;
    expect(() => YamlTemplateElementReader.getStrict().readFromString(element)).toThrow(/Unknown child type "boolean"/);
  });
});

describe("a schema artifact's metadata is held to the Java reader's rules", () => {
  const fullElement = `type: "element"
name: "Address"
id: "https://repo.metadatacenter.org/template-elements/e1"
modelVersion: "1.6.0"
`;
  const readers: ReadonlyArray<readonly [string, string, (yaml: string) => AbstractSchemaArtifact]> = [
    ['template', fullTemplate, (yaml: string) => YamlTemplateReader.getStrict().readFromString(yaml).template],
    ['element', fullElement, (yaml: string) => YamlTemplateElementReader.getStrict().readFromString(yaml).element],
    ['field', fullField, (yaml: string) => YamlTemplateFieldReader.getStrict().readFromString(yaml).field],
  ];
  /** The document with `key` stated as `value` at its top level, or left out where `value` is absent. */
  const stating = (yaml: string, key: string, value?: string) =>
    yaml
      .split('\n')
      .filter((line) => !line.startsWith(`${key}:`))
      .join('\n') + (value === undefined ? '' : `${key}: ${value}\n`);

  // Each was read as whatever the document held, and the JSON writer then wrote it.
  describe.each(readers)('the %s reader', (kind: string, yaml: string, read: (yaml: string) => AbstractSchemaArtifact) => {
    test.each([
      ['no name', 'name', undefined, /No name present\. .* must have a name/],
      ['an empty name', 'name', '""', /Expected a non-empty string at \/name/],
      ['a name that is a number', 'name', '42', /Expected a string at \/name/],
      ['a null name', 'name', 'null', /null is not a valid value at \/name/],
      ['a description that is a number', 'description', '42', /Expected a string at \/description/],
      ['an identifier that is a number', 'identifier', '42', /Expected a string at \/identifier/],
      ['a language that is a mapping', 'language', '{code: "en"}', /Expected a string at \/language/],
      ['a model version this library does not read', 'modelVersion', '"1.5.0"', /Invalid modelVersion "1\.5\.0" at \/modelVersion/],
      ['an empty createdBy', 'createdBy', '""', /An empty string is not a URI at "createdBy"/],
      ['a createdBy that is a number', 'createdBy', '42', /Invalid URI at "createdBy": expected a string/],
      ['an empty modifiedBy', 'modifiedBy', '""', /An empty string is not a URI at "modifiedBy"/],
      ['a modifiedBy that is not an IRI', 'modifiedBy', '"a user"', /Invalid URI\/IRI at "modifiedBy": unescaped space/],
      ['a null createdOn', 'createdOn', 'null', /null is not a valid value at \/createdOn/],
      ['a createdOn that is a number', 'createdOn', '42', /Expected a string at \/createdOn/],
      ['a status no artifact has', 'status', '"bogus"', /Invalid status "bogus" at \/status/],
      ['a status that is a number', 'status', '42', /Expected a string at \/status/],
      ['annotations that are not a mapping', 'annotations', '42', /Expected a mapping at \/annotations\./],
      ['an empty annotations block', 'annotations', '{}', /empty mapping \(\{\}\) is not a valid value at \/annotations/],
      ['an annotation value that is a number', 'annotations', '{note: {value: 42}}', /Expected a string at \/annotations\/note\/value/],
      ['an annotation id that is a number', 'annotations', '{note: {id: 42}}', /Invalid URI at "annotations\/note\/id": expected a string/],
      ['an empty annotation id', 'annotations', '{note: {id: ""}}', /An empty string is not a URI at "annotations\/note\/id"/],
    ])('refuses %s', (_label: string, key: string, value: string | undefined, refusal: RegExp) => {
      expect(() => read(stating(yaml, key, value))).toThrow(refusal);
    });

    test('reads metadata that keeps to the rules', () => {
      const metadata = `description: ""
identifier: "S1"
language: "en"
createdBy: "https://metadatacenter.org/users/u1"
modifiedBy: "https://metadatacenter.org/users/u2"
createdOn: "2024-01-01T10:00:00-07:00"
annotations:
  note: {value: "A note"}
  link: {id: "https://example.org/a"}
`;
      const artifact = read(yaml + metadata);
      expect(artifact.schema_identifier).toBe('S1');
      expect(artifact.pav_createdBy.getValue()).toBe('https://metadatacenter.org/users/u1');
      expect(artifact.oslc_modifiedBy.getValue()).toBe('https://metadatacenter.org/users/u2');
      expect(artifact.annotations?.get('note')).toBeInstanceOf(AnnotationAtValue);
      expect(artifact.annotations?.get('link')).toBeInstanceOf(AnnotationAtId);
    });

    // Java's reader reads an empty status as none, and the artifact at the top takes the default.
    test('an empty status reads as draft', () => {
      expect(read(stating(yaml, 'status', '""')).bibo_status).toBe(BiboStatus.DRAFT);
    });

    test('an annotation that states a literal and an IRI is read as the literal', () => {
      const artifact = read(stating(yaml, 'annotations', '{note: {value: "A note", id: "https://example.org/a"}}'));
      expect(artifact.annotations?.get('note')).toEqual(new AnnotationAtValue('note', 'A note'));
    });

    if (kind !== 'field') {
      test.each(['header', 'footer'])('refuses a %s that is not a string', (key: string) => {
        expect(() => read(stating(yaml, key, '42'))).toThrow(new RegExp(`Expected a string at /${key}`));
      });
    }

    if (kind !== 'template') {
      test('refuses a preferred label that is not a string', () => {
        expect(() => read(stating(yaml, 'prefLabel', '42'))).toThrow(/Expected a string at \/prefLabel/);
      });

      test('refuses an empty alternative label, and passes over one that is not a string, as Java does', () => {
        expect(() => read(stating(yaml, 'altLabels', '["Other", ""]'))).toThrow(/Expected a non-empty string at \/altLabels\[1\]/);
        expect(read(stating(yaml, 'altLabels', '[42, "Other"]'))).toHaveProperty('skos_altLabel', ['Other']);
      });
    }
  });

  // A document that did not say it was a template or an element, or said it was something else, was read as one.
  test.each([
    ['A template', 'template', fullTemplate, (yaml: string) => YamlTemplateReader.getStrict().readFromString(yaml)],
    ['An element', 'element', fullElement, (yaml: string) => YamlTemplateElementReader.getStrict().readFromString(yaml)],
  ])('%s states its type, and it is its own', (artifact: string, type: string, yaml: string, read: (yaml: string) => unknown) => {
    expect(() => read(stating(yaml, 'type'))).toThrow(`No type present. ${artifact} states its type, "${type}".`);
    expect(() => read(stating(yaml, 'type', '42'))).toThrow(/Expected a string at \/type/);
    expect(() => read(stating(yaml, 'type', '"instance"'))).toThrow(
      `Invalid artifact type "instance" at /type. ${artifact} has the type "${type}".`,
    );
  });

  // A child's metadata is held to the same rules, and the refusal says which child.
  test.each([
    ['name: 42', /Expected a string at \/children\/Study Name\/name/],
    ['createdBy: ""', /An empty string is not a URI at "children\/Study Name\/createdBy"/],
    ['annotations: {note: {id: 42}}', /Invalid URI at "children\/Study Name\/annotations\/note\/id"/],
    ['status: "bogus"', /Invalid status "bogus" at \/children\/Study Name\/status/],
  ])('a child stating %s is refused', (metadata: string, refusal: RegExp) => {
    const key = metadata.slice(0, metadata.indexOf(':'));
    const childLines = fullTemplate.split('\n').filter((line) => !line.startsWith(`    ${key}:`));
    const child = `${childLines.join('\n')}    ${metadata}\n`;
    expect(() => YamlTemplateReader.getStrict().readFromString(child)).toThrow(refusal);
  });

  test('a child without a name is refused, and the refusal says which child', () => {
    const child = fullTemplate.replace('    name: "Study Name"\n', '');
    expect(() => YamlTemplateReader.getStrict().readFromString(child)).toThrow(
      'No name present at /children/Study Name. A field must have a name.',
    );
  });
});

// Java's reader refuses null, an empty mapping and an empty list anywhere in a schema document, and so
// does this one. Only the metadata keys were held to the rule here, so a null or empty value anywhere
// else was read as though the key were absent, or failed on a TypeError. The refusal names the value's
// place in the document, a child by its position in the list, as Java's does.
describe('null, an empty mapping and an empty list are refused anywhere in a schema document', () => {
  const readTemplate = (yaml: string) => YamlTemplateReader.getStrict().readFromString(yaml).template;
  const readElement = (yaml: string) => YamlTemplateElementReader.getStrict().readFromString(yaml).element;
  const readField = (yaml: string) => YamlTemplateFieldReader.getStrict().readFromString(yaml).field;
  const template = (children: string) =>
    `type: "template"\nname: "T"\nid: "https://repo.metadatacenter.org/templates/t1"\nmodelVersion: "1.6.0"\n${children}`;
  const field = (type: string, keys: string) =>
    `type: "${type}"\nname: "F"\nid: "https://repo.metadatacenter.org/template-fields/f1"\nmodelVersion: "1.6.0"\n${keys}`;
  const child = (keys: string) => `children:\n  - key: "C"\n    type: "text-field"\n    name: "C"\n    modelVersion: "1.6.0"\n${keys}`;

  test.each([
    ['an empty children list', () => readTemplate(template('children: []\n')), /empty list \(\[\]\) is not a valid value at \/children;/],
    ['a null children list', () => readTemplate(template('children: null\n')), /null is not a valid value at \/children;/],
    ['a null child', () => readTemplate(template('children:\n  - null\n')), /null is not a valid value at \/children\[0\];/],
    [
      'an empty configuration',
      () => readField(field('text-field', 'configuration: {}\n')),
      /empty mapping \(\{\}\) is not a valid value at \/configuration;/,
    ],
    [
      'a null configuration',
      () => readField(field('text-field', 'configuration: null\n')),
      /null is not a valid value at \/configuration;/,
    ],
    [
      'a null required',
      () => readField(field('text-field', 'configuration:\n  required: null\n')),
      /null is not a valid value at \/configuration\/required;/,
    ],
    ['a null minLength', () => readField(field('text-field', 'minLength: null\n')), /null is not a valid value at \/minLength;/],
    ['a minLength spelled ~', () => readField(field('text-field', 'minLength: ~\n')), /null is not a valid value at \/minLength;/],
    ['a minLength with no value', () => readField(field('text-field', 'minLength:\n')), /null is not a valid value at \/minLength;/],
    ['a null default', () => readField(field('text-field', 'default: null\n')), /null is not a valid value at \/default;/],
    [
      'an empty default',
      () => readField(field('controlled-term-field', 'default: {}\n')),
      /empty mapping \(\{\}\) is not a valid value at \/default;/,
    ],
    ['a null datatype', () => readField(field('numeric-field', 'datatype: null\n')), /null is not a valid value at \/datatype;/],
    ['a null granularity', () => readField(field('temporal-field', 'granularity: null\n')), /null is not a valid value at \/granularity;/],
    [
      'an empty list of values',
      () => readField(field('radio-field', 'values: []\n')),
      /empty list \(\[\]\) is not a valid value at \/values;/,
    ],
    [
      'a null option label',
      () => readField(field('radio-field', 'values:\n  - label: null\n')),
      /null is not a valid value at \/values\[0\]\/label;/,
    ],
    [
      'an empty ontology constraint',
      () => readField(field('controlled-term-field', 'values:\n  - {}\n')),
      /empty mapping \(\{\}\) is not a valid value at \/values\[0\];/,
    ],
    ['a key this library does not read', () => readField(field('text-field', 'unread: null\n')), /null is not a valid value at \/unread;/],
    [
      "an empty child's configuration",
      () => readTemplate(template(child('    configuration: {}\n'))),
      /empty mapping \(\{\}\) is not a valid value at \/children\[0\]\/configuration;/,
    ],
    [
      "a null override of a child's label",
      () => readTemplate(template(child('    configuration:\n      overrideLabel: null\n'))),
      /null is not a valid value at \/children\[0\]\/configuration\/overrideLabel;/,
    ],
    [
      "a null child's maxLength",
      () => readTemplate(template(child('    maxLength: null\n'))),
      /null is not a valid value at \/children\[0\]\/maxLength;/,
    ],
    [
      "a null field's minLength in an element",
      () =>
        readElement(
          `type: "element"\nname: "E"\nid: "https://repo.metadatacenter.org/template-elements/e1"\nmodelVersion: "1.6.0"\n${child('    minLength: null\n')}`,
        ),
      /null is not a valid value at \/children\[0\]\/minLength;/,
    ],
    [
      'an extensions key where no artifact is',
      () => readTemplate(template(child('    configuration:\n      extensions: {}\n'))),
      /empty mapping \(\{\}\) is not a valid value at \/children\[0\]\/configuration\/extensions;/,
    ],
  ])('refuses %s', (_label: string, read: () => unknown, refusal: RegExp) => {
    expect(read).toThrow(refusal);
  });

  // Java makes one exception. An artifact's extensions are opaque JSON, in which null and empty values
  // are values, and the extension reader holds the block to its own rules.
  const extensions = `extensions:\n  prefixes:\n    ex: "https://example.org/"\n  properties:\n    ex:none: null\n    ex:map: {}\n    ex:list: []\n`;
  const kept = { 'ex:none': null, 'ex:map': {}, 'ex:list': [] };

  test('keeps null and empty values in the extensions of a template, an element and a field', () => {
    expect(readTemplate(template(extensions)).extensions.properties).toEqual(kept);
    const element = `type: "element"\nname: "E"\nid: "https://repo.metadatacenter.org/template-elements/e1"\nmodelVersion: "1.6.0"\n`;
    expect(readElement(element + extensions).extensions.properties).toEqual(kept);
    expect(readField(field('text-field', extensions)).extensions.properties).toEqual(kept);
  });

  test("keeps them in a child's extensions, and in empty prefixes and properties", () => {
    const indented = extensions.replace(/^/gm, '    ').trimEnd() + '\n';
    const template1 = readTemplate(template(child(indented)));
    expect(template1.getChild('C')?.extensions.properties).toEqual(kept);
    const empty = readTemplate(template('extensions:\n  prefixes: {}\n  properties: {}\n'));
    expect(empty.extensions.isEmpty).toBe(true);
  });

  test('refuses an extensions block that is null or empty, as Java does', () => {
    expect(() => readTemplate(template('extensions: null\n'))).toThrow('extensions requires prefixes and properties objects');
    expect(() => readField(field('text-field', 'extensions: {}\n'))).toThrow('extensions requires prefixes and properties objects');
  });
});
