import { YamlTemplateReader } from '../../../../../src/org/metadatacenter/io/reader/yaml/YamlTemplateReader';
import { YamlTemplateFieldReader } from '../../../../../src/org/metadatacenter/io/reader/yaml/YamlTemplateFieldReader';
import { YamlTemplateInstanceReader } from '../../../../../src/org/metadatacenter/io/reader/yaml/YamlTemplateInstanceReader';
import { AbstractDynamicChildDeploymentInfo } from '../../../../../src/org/metadatacenter/model/cedar/deployment/AbstractDynamicChildDeploymentInfo';
import { InstanceDataAttributeValueField } from '../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataAttributeValueField';
import { InstanceDataContainer } from '../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataContainer';
import { InstanceDataStringAtom } from '../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataStringAtom';

/**
 * A key the YAML form does not have is refused with its path, where it used to be dropped, as the
 * Java library's reader refuses it.
 *
 * The same mistake in JSON is refused by the validator, so a misspelled `descripton:` was the one edit
 * that could reach the repository without its value and without a word. A key is also refused where
 * the form has it only for another type: a unit is a numeric field's, and a text field stating one
 * would otherwise have it read and lost. The keys a document chooses itself stay open: children,
 * annotations, and the attribute names of an attribute-value field. A key holding a mapping beside an
 * instance's `children` is read as an attribute-value field, because only the template can say
 * whether it is one.
 */
const TEMPLATE = `type: template
name: "T"
modelVersion: 1.6.0
children:
  - key: "Title"
    type: text-field
    name: "Title"
    modelVersion: 1.6.0
    configuration:
      required: true
  - key: "Block"
    type: element
    name: "Block"
    modelVersion: 1.6.0
    children:
      - key: "Inner"
        type: text-field
        name: "Inner"
        modelVersion: 1.6.0
`;

const INSTANCE = `type: instance
name: "Instance"
isBasedOn: "https://repo.metadatacenter.org/templates/t1"
children:
  Title:
    value: "A title"
  Block:
    id: "https://repo.metadatacenter.org/template-element-instances/e1"
    children:
      Inner:
        value: "x"
    More:
      Weight:
        value: "3"
Extra:
  Colour:
    value: "red"
`;

const template = (yaml: string) => YamlTemplateReader.getStrict().readFromString(yaml).template;
const instance = (yaml: string) => YamlTemplateInstanceReader.getStrict().readFromString(yaml).instance;
const refusal = (key: string, location: string) => `Unknown key "${key}" at ${location}; it is not part of this artifact's YAML form.`;

describe('a YAML key the form does not have', () => {
  test('is absent from the documents as written, which read', () => {
    const title = template(TEMPLATE).getChildInfo('Title');
    expect(title).toBeInstanceOf(AbstractDynamicChildDeploymentInfo);
    expect(title instanceof AbstractDynamicChildDeploymentInfo && title.requiredValue).toBe(true);
    const values = instance(INSTANCE).dataContainer.values;
    expect(((values['Extra'] as InstanceDataAttributeValueField).values['Colour'] as InstanceDataStringAtom).value).toBe('red');
    const block = values['Block'] as InstanceDataContainer;
    expect(((block.values['More'] as InstanceDataAttributeValueField).values['Weight'] as InstanceDataStringAtom).value).toBe('3');
  });

  test('is refused where a template states it', () => {
    expect(() => template(TEMPLATE.replace('name: "T"\n', 'name: "T"\ndescripton: "lost"\n'))).toThrow(
      refusal('descripton', '/descripton'),
    );
  });

  test("is refused where a child's configuration states it", () => {
    expect(() => template(TEMPLATE.replace('required: true', 'requird: true'))).toThrow(
      refusal('requird', '/children/Title/configuration/requird'),
    );
  });

  test('is refused where a child inside an element states it', () => {
    expect(() => template(TEMPLATE.replace('name: "Inner"\n', 'name: "Inner"\n        labl: "x"\n'))).toThrow(
      refusal('labl', '/children/Block/children/Inner/labl'),
    );
  });

  test("is refused where the form has it only for another field type, as a numeric field's unit on a text field", () => {
    expect(() => template(TEMPLATE.replace('name: "Inner"\n', 'name: "Inner"\n        unit: "cm"\n'))).toThrow(
      refusal('unit', '/children/Block/children/Inner/unit'),
    );
  });

  test("is refused where a standalone field states it, and a field's own spelling of its settings reads", () => {
    const field = (body: string) =>
      YamlTemplateFieldReader.getStrict().readFromString(`type: text-field\nname: "F"\nmodelVersion: 1.6.0\n${body}`).field;
    expect(field('hidden: true\nconfiguration:\n  required: true\n').requiredValue).toBe(true);
    expect(() => field('hiden: true\n')).toThrow(refusal('hiden', '/hiden'));
  });

  test('is refused where a child of another model version states its version', () => {
    expect(() => template(TEMPLATE.replace(/(key: "Title"[\s\S]*?modelVersion: )\S+/, '$11.0.0'))).toThrow(
      'Invalid modelVersion "1.0.0" at /children/Title/modelVersion.',
    );
  });

  test("is refused where a scalar sits beside an instance's children", () => {
    expect(() => instance(`${INSTANCE}bogusKey: 1\n`)).toThrow(refusal('bogusKey', '/bogusKey'));
  });

  test("is refused where a field's value states it", () => {
    expect(() => instance(INSTANCE.replace('value: "A title"\n', 'value: "A title"\n    labl: "x"\n'))).toThrow(
      refusal('labl', '/children/Title/labl'),
    );
  });

  test('is refused where an attribute states it', () => {
    expect(() => instance(INSTANCE.replace('value: "red"', 'valu: "red"'))).toThrow(refusal('valu', '/Extra/Colour/valu'));
    expect(() => instance(INSTANCE.replace('value: "3"', 'valu: "3"'))).toThrow(refusal('valu', '/children/Block/More/Weight/valu'));
  });

  test("is refused where a scalar sits beside an element's children", () => {
    expect(() => instance(INSTANCE.replace('    More:\n', '    labl: "x"\n    More:\n'))).toThrow(refusal('labl', '/children/Block/labl'));
  });

  test("is never an attribute's name, which the document chooses", () => {
    const values = instance(INSTANCE.replace('Colour:', 'descripton:')).dataContainer.values;
    expect(Object.keys((values['Extra'] as InstanceDataAttributeValueField).values)).toEqual(['descripton']);
  });
});
