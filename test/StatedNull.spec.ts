import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CedarArtifactId, CedarWriters, InstanceInflater, JsonNode, JsonTemplateInstanceReader, JsonTemplateReader } from '../src';

/**
 * A value can state `rdfs:label` as null, and a stored template can require the key. The model keeps the
 * null as no value, so the writer left the key out, and the written document failed the template the
 * stored one satisfied. The writer keeps a stated null exactly where the stored template requires its key,
 * as the Java library's writer does.
 */
const corpus = join(__dirname, '..', 'cedar-test-artifacts', 'artifacts', 'cee-suite', '017');
const SINGLE = 'Datetime Field 1 (month/year)';
const REPEATED = 'Datetime Field 4 (datetime multiple)';

type Node = Record<string, unknown>;

function storedTemplate(single: string[], repeated: string[]): Node {
  const template = JSON.parse(readFileSync(join(corpus, 'template-017.json'), 'utf8')) as Node;
  const properties = template.properties as Record<string, Node>;
  (properties[SINGLE].required as string[]).push(...single);
  ((properties[REPEATED].items as Node).required as string[]).push(...repeated);
  return template;
}

function storedInstance(): Node {
  const instance = JSON.parse(readFileSync(join(corpus, 'instance-017.json'), 'utf8')) as Node;
  (instance[SINGLE] as Node)['rdfs:label'] = null;
  ((instance[REPEATED] as Node[])[0] as Node)['rdfs:label'] = null;
  return instance;
}

function written(template: Node, inflate: 'inflate' | 'inflated' | 'none' = 'inflate'): Node {
  const instance = JsonTemplateInstanceReader.getFebruary2024().readFromObject(storedInstance() as JsonNode).instance;
  instance.schema_isBasedOn = CedarArtifactId.forValue(template['@id'] as string);
  const model = JsonTemplateReader.getFebruary2024().readFromObject(template as JsonNode).template;
  const writer = CedarWriters.json().getFebruary2024().getTemplateInstanceWriter();
  if (inflate === 'none') return writer.getAsJsonNode(instance) as unknown as Node;
  const completed =
    inflate === 'inflated' ? InstanceInflater.inflated(instance, model, 'empty') : InstanceInflater.inflate(instance, model, 'empty');
  return writer.getAsJsonNode(completed) as unknown as Node;
}

describe('a stated null', () => {
  test('is kept where the stored template requires its key', () => {
    const document = written(storedTemplate(['rdfs:label'], ['rdfs:label']));
    expect(Object.entries(document[SINGLE] as Node)).toEqual([
      ['@value', '2023-08-31'],
      ['rdfs:label', null],
      ['@type', 'xsd:date'],
    ]);
    const [first, second] = document[REPEATED] as Node[];
    expect(Object.keys(first)).toEqual(['@value', 'rdfs:label', '@type']);
    // A value that stated no null gains none: only a stated null is kept.
    expect(Object.keys(second)).toEqual(['@value', '@type']);
  });

  test('is dropped where the stored template does not require its key', () => {
    const document = written(storedTemplate([], []));
    expect(Object.keys(document[SINGLE] as Node)).toEqual(['@value', '@type']);
    expect(Object.keys((document[REPEATED] as Node[])[0])).toEqual(['@value', '@type']);
  });

  test("is kept only where its own field's value schema requires it", () => {
    const document = written(storedTemplate([], ['rdfs:label']));
    expect(Object.keys(document[SINGLE] as Node)).toEqual(['@value', '@type']);
    expect(Object.keys((document[REPEATED] as Node[])[0])).toEqual(['@value', 'rdfs:label', '@type']);
  });

  test('is not written without the template', () => {
    expect(Object.keys(written(storedTemplate(['rdfs:label'], ['rdfs:label']), 'none')[SINGLE] as Node)).toEqual(['@value', '@type']);
  });

  test('is kept by the completed copy, leaving the instance itself as it was', () => {
    const template = storedTemplate(['rdfs:label'], ['rdfs:label']);
    const instance = JsonTemplateInstanceReader.getFebruary2024().readFromObject(storedInstance() as JsonNode).instance;
    instance.schema_isBasedOn = CedarArtifactId.forValue(template['@id'] as string);
    const model = JsonTemplateReader.getFebruary2024().readFromObject(template as JsonNode).template;
    const writer = CedarWriters.json().getFebruary2024().getTemplateInstanceWriter();
    const completed = writer.getAsJsonNode(InstanceInflater.inflated(instance, model, 'empty')) as unknown as Node;
    expect(Object.keys(completed[SINGLE] as Node)).toEqual(['@value', 'rdfs:label', '@type']);
    expect(Object.keys((writer.getAsJsonNode(instance) as unknown as Node)[SINGLE] as Node)).toEqual(['@value', '@type']);
  });
});
