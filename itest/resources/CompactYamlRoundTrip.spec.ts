import {
  CedarWriters,
  JsonTemplateElementReader,
  JsonTemplateFieldReader,
  JsonTemplateInstanceReader,
  JsonTemplateReader,
  YamlTemplateElementReader,
  YamlTemplateFieldReader,
  YamlTemplateInstanceReader,
  YamlTemplateReader,
} from '../../src';
import { elementTestNumbers, fieldTestNumbers, instanceTestNumbers, templateTestNumbers } from './generatedTestCases';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';

// The compact form is the same artifact with the content the system records about it left out: the
// model version, the version, the status and the provenance. Everything else it must carry, or a
// reader cannot recover the artifact it came from. These cases are the corpus artifacts themselves,
// each written compact and read back, so the coverage follows the corpus rather than a fixture
// written by hand.

const systemRecordedKeys = ['modelVersion', 'version', 'status', 'createdOn', 'createdBy', 'modifiedOn', 'modifiedBy'];

type Kind = 'template' | 'element' | 'field' | 'instance';

interface Roundtrip {
  compact: string;
  again: string;
  id: string | null;
  name: string | null;
}

function roundTrip(kind: Kind, testNumber: number): Roundtrip {
  const writers = CedarWriters.yaml().getStrict();
  if (kind === 'template') {
    const resource = TestResource.template(testNumber);
    const template = JsonTemplateReader.getStrict().readFromString(TestUtil.readReferenceJson(resource)).template;
    const writer = writers.getTemplateWriter();
    const compact = writer.getAsYamlString(template, true);
    const reread = YamlTemplateReader.getStrict().readFromString(compact).template;
    return {
      compact,
      again: writer.getAsYamlString(reread, true),
      id: reread.at_id.getValue(),
      name: reread.schema_name,
    };
  }
  if (kind === 'element') {
    const resource = TestResource.element(testNumber);
    const element = JsonTemplateElementReader.getStrict().readFromString(TestUtil.readReferenceJson(resource)).element;
    const writer = writers.getTemplateElementWriter();
    const compact = writer.getAsYamlString(element, true);
    const reread = YamlTemplateElementReader.getStrict().readFromString(compact).element;
    return {
      compact,
      again: writer.getAsYamlString(reread, true),
      id: reread.at_id.getValue(),
      name: reread.schema_name,
    };
  }
  if (kind === 'field') {
    const resource = TestResource.field(testNumber);
    const field = JsonTemplateFieldReader.getStrict().readFromString(TestUtil.readReferenceJson(resource)).field;
    const writer = writers.getFieldWriterForField(field);
    const compact = writer.getAsYamlString(field, true);
    const reread = YamlTemplateFieldReader.getStrict().readFromString(compact).field;
    return {
      compact,
      again: writers.getFieldWriterForField(reread).getAsYamlString(reread, true),
      id: reread.at_id.getValue(),
      name: reread.schema_name,
    };
  }
  const resource = TestResource.instance(testNumber);
  const instance = JsonTemplateInstanceReader.getStrict().readFromString(TestUtil.readReferenceJson(resource)).instance;
  const writer = writers.getTemplateInstanceWriter();
  const compact = writer.getAsYamlString(instance, true);
  const reread = YamlTemplateInstanceReader.getStrict().readFromString(compact).instance;
  return {
    compact,
    again: writer.getAsYamlString(reread, true),
    id: reread.at_id.getValue(),
    name: reread.schema_name,
  };
}

function sourceId(kind: Kind, testNumber: number): string | null {
  const resource =
    kind === 'template'
      ? TestResource.template(testNumber)
      : kind === 'element'
        ? TestResource.element(testNumber)
        : kind === 'field'
          ? TestResource.field(testNumber)
          : TestResource.instance(testNumber);
  const source = TestUtil.readReferenceJson(resource);
  switch (kind) {
    case 'template':
      return JsonTemplateReader.getStrict().readFromString(source).template.at_id.getValue();
    case 'element':
      return JsonTemplateElementReader.getStrict().readFromString(source).element.at_id.getValue();
    case 'field':
      return JsonTemplateFieldReader.getStrict().readFromString(source).field.at_id.getValue();
    default:
      return JsonTemplateInstanceReader.getStrict().readFromString(source).instance.at_id.getValue();
  }
}

// Two asymmetries in the YAML pair keep a case from returning what it wrote. Both show in the full
// form as well, so neither belongs to the compact form, and both are excluded here by name rather
// than passed over silently.
//
//  - template 20: a list field whose value constraints carry a scalar defaultValue writes it as
//    `default`, and no list-field YAML reader reads that key back.
//  - instance 21: an IRI annotation is written and not read back. The same instance also loses its
//    provenance through the full form, which the compact form does not carry in the first place.
const unstableThroughTheYamlReader: Partial<Record<Kind, number[]>> = { template: [20], instance: [21] };

const cases: Array<[Kind, number[]]> = [
  ['template', templateTestNumbers],
  ['element', elementTestNumbers],
  ['field', fieldTestNumbers],
  ['instance', instanceTestNumbers],
];

describe.each(cases)('compact YAML round trip: %s', (kind: Kind, testNumbers: number[]) => {
  test.each(testNumbers)(`${kind} %i survives a compact round trip`, (testNumber: number) => {
    const result = roundTrip(kind, testNumber);

    // Writing what was read must reproduce the document, or the form is not a round trip.
    if (!(unstableThroughTheYamlReader[kind] ?? []).includes(testNumber)) {
      expect(result.again).toEqual(result.compact);
    }

    // The identifier is the artifact. Losing it through the compact form would leave a document
    // that reads back as a different, anonymous artifact. Some corpus fixtures carry no identifier
    // to begin with; what matters is that the form does not invent or drop one.
    const expectedId = sourceId(kind, testNumber);
    expect(result.id).toEqual(expectedId);
    if (expectedId !== null) {
      expect(result.compact).toContain(`id: "${expectedId}"`);
    }

    // The name is what the form is for.
    expect(result.name).not.toBeNull();
  });
});

describe('what the compact form leaves out', () => {
  test.each(templateTestNumbers)('template %i carries no system-recorded key at the root', (testNumber: number) => {
    const compact = roundTrip('template', testNumber).compact;
    const rootKeys = compact
      .split('\n')
      .filter((line) => /^[a-zA-Z]/.test(line))
      .map((line) => line.split(':')[0]);
    expect(rootKeys.filter((key) => systemRecordedKeys.includes(key))).toEqual([]);
  });

  test('the full form carries them, so the difference is the compact form and not the artifact', () => {
    // Template 2 is a plain template carrying every system-recorded key.
    const resource = TestResource.template(2);
    const template = JsonTemplateReader.getStrict().readFromString(TestUtil.readReferenceJson(resource)).template;
    const writer = CedarWriters.yaml().getStrict().getTemplateWriter();
    const full = writer.getAsYamlString(template, false);
    const compact = writer.getAsYamlString(template, true);
    for (const key of systemRecordedKeys) {
      expect(full).toContain(`${key}: "`);
      expect(compact).not.toContain(`${key}: "`);
    }
    // And the identifier is in both.
    expect(full).toContain('id: "');
    expect(compact).toContain('id: "');
  });
});
