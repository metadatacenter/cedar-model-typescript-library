import { YamlTemplateElementReader, YamlTemplateFieldReader, YamlTemplateInstanceReader, YamlTemplateReader } from '../../../../../src';

// What this library refuses, the Java library refuses too: a document in the compact form given to a
// reader that was not asked for it, and a field type it does not know. Both used to be absorbed —
// the first into an artifact with an absent model version, the second into a typeless field that
// reported success and then broke whichever writer was handed it. The unknown type used here is
// `boolean`, the spelling this library wrote before the boolean field was renamed `boolean-field`.

const fullField = `type: "text-field"
name: "Study Name"
id: "https://repo.metadatacenter.org/template-fields/f1"
modelVersion: "1.6.0"
`;

const compactField = `type: "text-field"
name: "Study Name"
id: "https://repo.metadatacenter.org/template-fields/f1"
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
id: "https://repo.metadatacenter.org/templates/t1"
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

describe('an unknown field type is refused', () => {
  test('a spelling this library once wrote is not a type it knows now', () => {
    // The boolean field's token was `boolean` until it was renamed to `boolean-field`, which is what
    // every other field type is called and what the Java library has always written. A document
    // carrying the old spelling is refused rather than read into a field with no type.
    const old = fullField.replace('type: "text-field"', 'type: "boolean"');
    expect(() => YamlTemplateFieldReader.getStrict().readFromString(old)).toThrow(/Unknown field type "boolean"/);
  });

  test('the boolean field reads under the name every other field type uses', () => {
    const boolean = fullField.replace('type: "text-field"', 'type: "boolean-field"');
    expect(YamlTemplateFieldReader.getStrict().readFromString(boolean).field.schema_name).toBe('Study Name');
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
