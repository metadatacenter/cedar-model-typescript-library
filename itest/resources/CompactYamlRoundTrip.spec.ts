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

// The compact form names only the artifact at the document root. It leaves out repository-owned
// identities below that root together with the model version, version, status and provenance. These
// cases are the corpus artifacts themselves, each written compact and read back, so the coverage
// follows the corpus rather than a fixture written by hand.

const systemRecordedKeys = ['modelVersion', 'version', 'status', 'createdOn', 'createdBy', 'modifiedOn', 'modifiedBy'];

type Kind = 'template' | 'element' | 'field' | 'instance';

interface Roundtrip {
  compact: string;
  again: string;
  full: string;
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
    const reread = YamlTemplateReader.getStrictForCompact().readFromString(compact).template;
    const full = writer.getAsYamlString(template, false);
    return {
      compact,
      again: writer.getAsYamlString(reread, true),
      full,
      id: reread.at_id.getValue(),
      name: reread.schema_name,
    };
  }
  if (kind === 'element') {
    const resource = TestResource.element(testNumber);
    const element = JsonTemplateElementReader.getStrict().readFromString(TestUtil.readReferenceJson(resource)).element;
    const writer = writers.getTemplateElementWriter();
    const compact = writer.getAsYamlString(element, true);
    const reread = YamlTemplateElementReader.getStrictForCompact().readFromString(compact).element;
    const full = writer.getAsYamlString(element, false);
    return {
      compact,
      again: writer.getAsYamlString(reread, true),
      full,
      id: reread.at_id.getValue(),
      name: reread.schema_name,
    };
  }
  if (kind === 'field') {
    const resource = TestResource.field(testNumber);
    const field = JsonTemplateFieldReader.getStrict().readFromString(TestUtil.readReferenceJson(resource)).field;
    const writer = writers.getFieldWriterForField(field);
    const compact = writer.getAsYamlString(field, true);
    const reread = YamlTemplateFieldReader.getStrictForCompact().readFromString(compact).field;
    const full = writer.getAsYamlString(field, false);
    return {
      compact,
      again: writers.getFieldWriterForField(reread).getAsYamlString(reread, true),
      full,
      id: reread.at_id.getValue(),
      name: reread.schema_name,
    };
  }
  const resource = TestResource.instance(testNumber);
  const instance = JsonTemplateInstanceReader.getStrict().readFromString(TestUtil.readReferenceJson(resource)).instance;
  const writer = writers.getTemplateInstanceWriter();
  const compact = writer.getAsYamlString(instance, true);
  const reread = YamlTemplateInstanceReader.getStrict().readFromString(compact).instance;
  const full = writer.getAsYamlString(instance, false);
  return {
    compact,
    again: writer.getAsYamlString(reread, true),
    full,
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

const cases: Array<[Kind, number[]]> = [
  ['template', templateTestNumbers],
  ['element', elementTestNumbers],
  ['field', fieldTestNumbers],
  ['instance', instanceTestNumbers],
];

describe.each(cases)('compact YAML round trip: %s', (kind: Kind, testNumbers: number[]) => {
  test.each(testNumbers)(`${kind} %i survives a compact round trip`, (testNumber: number) => {
    const result = roundTrip(kind, testNumber);

    // A compact read and second compact write must reach a fixpoint. Re-expanding the result need not
    // reproduce the source full form because nested repository identities were intentionally omitted.
    expect(result.again).toEqual(result.compact);

    // The document-root identifier survives. Some corpus fixtures carry none to begin with; what
    // matters is that compact YAML does not invent or drop the top-level identity.
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
      expect(full).toContain(`${key}:`);
      expect(compact).not.toContain(`${key}:`);
    }
    // Document-root identity is in both forms.
    expect(full).toContain('id: "');
    expect(compact).toContain('id: "');
  });
});
