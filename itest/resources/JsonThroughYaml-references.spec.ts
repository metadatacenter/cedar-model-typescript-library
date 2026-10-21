import * as fs from 'node:fs';
import * as path from 'node:path';
import { CedarReaders, CedarWriters, InstanceInflater, JsonNode, Template } from '../../src';
import { TestUtil } from '../TestUtil';
import { TestResource } from '../TestResource';
import { ceeSuiteTestMap, elementTestNumbers, fieldTestNumbers, instanceTestNumbers, templateTestNumbers } from './generatedTestCases';
import { compareInstanceTrip, compareSchemaTrip, TripDifference, TripFamily } from './JsonThroughYaml';
import { TRIP_EXCLUSIONS, TRIP_FAMILIES } from './yamlTripExpectations';

// Every corpus artifact is written as JSON twice: straight from the model the JSON source yields, and
// from the model that model's own YAML yields. The two must agree apart from the families the YAML
// form is known to produce, and each case shows exactly the families declared for it.

const jsonWriters = () => CedarWriters.json().getStrict();
const yamlWriters = () => CedarWriters.yaml().getStrict();
const jsonReaders = () => CedarReaders.json().getStrict();
const yamlReaders = () => CedarReaders.yaml().getStrict();
const written = (json: string): JsonNode => JSON.parse(json) as JsonNode;

const templateTrip = (source: string) => {
  const template = jsonReaders().getTemplateReader().readFromString(source).template;
  const back = yamlReaders().getTemplateReader().readFromString(yamlWriters().getTemplateWriter().getAsYamlString(template)).template;
  return compareSchemaTrip(
    written(jsonWriters().getTemplateWriter().getAsJsonString(template)),
    written(jsonWriters().getTemplateWriter().getAsJsonString(back)),
  );
};

const elementTrip = (source: string) => {
  const element = jsonReaders().getTemplateElementReader().readFromString(source).element;
  const back = yamlReaders()
    .getTemplateElementReader()
    .readFromString(yamlWriters().getTemplateElementWriter().getAsYamlString(element)).element;
  return compareSchemaTrip(
    written(jsonWriters().getTemplateElementWriter().getAsJsonString(element)),
    written(jsonWriters().getTemplateElementWriter().getAsJsonString(back)),
  );
};

const fieldTrip = (source: string) => {
  const field = jsonReaders().getTemplateFieldReader().readFromString(source).field;
  const back = yamlReaders()
    .getTemplateFieldReader()
    .readFromString(yamlWriters().getFieldWriterForField(field).getAsYamlString(field)).field;
  return compareSchemaTrip(
    written(jsonWriters().getFieldWriterForField(field).getAsJsonString(field)),
    written(jsonWriters().getFieldWriterForField(back).getAsJsonString(back)),
  );
};

// A YAML instance is completed against its template before it is stored, so the trip completes it too.
const instanceTrip = (source: string, template: Template) => {
  const instance = jsonReaders().getTemplateInstanceReader().readFromString(source).instance;
  const read = yamlReaders()
    .getTemplateInstanceReader()
    .readFromString(yamlWriters().getTemplateInstanceWriter().getAsYamlString(instance)).instance;
  const back = InstanceInflater.inflate(read, template);
  return compareInstanceTrip(
    written(jsonWriters().getTemplateInstanceWriter().getAsJsonString(instance)),
    written(jsonWriters().getTemplateInstanceWriter().getAsJsonString(back)),
  );
};

const pad = (n: number) => n.toString().padStart(3, '0');
const ceeCases = TestUtil.testMap(ceeSuiteTestMap, [], []);
const ceeTemplates = ceeCases.filter(([, definition]) => definition.template).map(([n]) => n);
const ceeInstances = ceeCases.filter(([, definition]) => definition.instance).map(([n]) => n);

// An instance names its template by identifier, and that template may sit in any case of the corpus.
const templateSources = new Map<string, string>();
const indexTemplate = (source: string) => {
  const id = (JSON.parse(source) as JsonNode)['@id'];
  if (typeof id === 'string' && !templateSources.has(id)) templateSources.set(id, source);
};
templateTestNumbers.forEach((n) => indexTemplate(TestUtil.readReferenceJson(TestResource.template(n))));
ceeTemplates
  .filter((n) => TRIP_EXCLUSIONS[`cee-template-${pad(n)}`] === undefined)
  .forEach((n) => {
    indexTemplate(TestUtil.readReferenceJson(TestResource.ceeSuite(n)));
  });
instanceTestNumbers.forEach((n) => {
  const beside = path.join(TestResource.instance(n).getDirectory(), `template-${pad(n)}.json`);
  if (fs.existsSync(beside)) indexTemplate(TestUtil.readResourceAsString(beside));
});

// Most CEE suite instances name no template, and CEE pairs each with the template in its own case.
const templateOf = (instanceSource: string, ownTemplate?: () => string): Template | undefined => {
  const basedOn = (JSON.parse(instanceSource) as JsonNode)['schema:isBasedOn'];
  const source = basedOn === undefined ? ownTemplate?.() : templateSources.get(String(basedOn));
  return source === undefined ? undefined : jsonReaders().getTemplateReader().readFromString(source).template;
};

interface TripCase {
  id: string;
  trip: () => TripDifference[];
}

const instanceCase = (id: string, source: () => string, ownTemplate?: () => string): TripCase => ({
  id,
  trip: () => {
    const template = templateOf(source(), ownTemplate);
    if (template === undefined) throw new Error(`${id} names a template no corpus case holds`);
    return instanceTrip(source(), template);
  },
});

const allCases: TripCase[] = [
  ...templateTestNumbers.map((n) => ({
    id: `template-${pad(n)}`,
    trip: () => templateTrip(TestUtil.readReferenceJson(TestResource.template(n))),
  })),
  ...elementTestNumbers.map((n) => ({
    id: `element-${pad(n)}`,
    trip: () => elementTrip(TestUtil.readReferenceJson(TestResource.element(n))),
  })),
  ...fieldTestNumbers.map((n) => ({ id: `field-${pad(n)}`, trip: () => fieldTrip(TestUtil.readReferenceJson(TestResource.field(n))) })),
  ...instanceTestNumbers.map((n) => instanceCase(`instance-${pad(n)}`, () => TestUtil.readReferenceJson(TestResource.instance(n)))),
  ...ceeTemplates.map((n) => ({
    id: `cee-template-${pad(n)}`,
    trip: () => templateTrip(TestUtil.readReferenceJson(TestResource.ceeSuite(n))),
  })),
  ...ceeInstances.map((n) =>
    instanceCase(
      `cee-instance-${pad(n)}`,
      () => TestUtil.readReferenceInstanceJson(TestResource.ceeSuite(n)),
      () => TestUtil.readReferenceJson(TestResource.ceeSuite(n)),
    ),
  ),
];
const cases = allCases.filter((c) => TRIP_EXCLUSIONS[c.id] === undefined);

const declared = (id: string): TripFamily[] => [...(TRIP_FAMILIES[id] ?? [])].sort();
// Every schema artifact may show schemaText, so it is allowed everywhere and declared nowhere.
const observed = (differences: TripDifference[]): TripFamily[] =>
  [...new Set(differences.flatMap((d) => (d.family === null || d.family === 'schemaText' ? [] : [d.family])))].sort();

describe('JSON written through YAML', () => {
  it('covers the whole corpus, less its declared exclusions', () => {
    const ids = new Set(allCases.map((c) => c.id));
    expect(allCases).toHaveLength(templateTestNumbers.length + elementTestNumbers.length + fieldTestNumbers.length + 21 + 85 + 57);
    expect(Object.keys(TRIP_EXCLUSIONS).filter((id) => !ids.has(id))).toEqual([]);
    expect(Object.keys(TRIP_FAMILIES).filter((id) => !ids.has(id) || TRIP_EXCLUSIONS[id] !== undefined)).toEqual([]);
  });

  it('excludes an instance only while no corpus case holds its template', () => {
    const excludedInstances = instanceTestNumbers.filter((n) => TRIP_EXCLUSIONS[`instance-${pad(n)}`] !== undefined);
    expect(excludedInstances.filter((n) => templateOf(TestUtil.readReferenceJson(TestResource.instance(n))) !== undefined)).toEqual([]);
  });

  it.each(cases.map((c) => [c.id, c] as const))('%s writes the same JSON through YAML, apart from its declared families', (_, c) => {
    const differences = c.trip();
    expect(differences.filter((d) => d.family === null)).toEqual([]);
    expect(observed(differences)).toEqual(declared(c.id));
  });
});

describe('the comparison behind it', () => {
  it('reports an absent description read as null', () => {
    const direct = { 'schema:description': '', _ui: { propertyDescriptions: { Child: '' } } };
    const viaYaml = { 'schema:description': null, _ui: { propertyDescriptions: { Child: null } } };
    expect(compareSchemaTrip(direct, viaYaml).map((d) => d.family)).toEqual([null, null]);
  });

  it('reports a value lost from a repeated field, however many empty occurrences surround it', () => {
    const direct = { Field: [{ '@value': 'a' }, { '@value': null }, { '@value': 'b' }] };
    const viaYaml = { Field: [{ '@value': 'a' }] };
    expect(compareInstanceTrip(direct, viaYaml).map((d) => d.family)).toEqual(['instanceCompletion', null]);
  });

  it('reports a changed context prefix, which no template supplies', () => {
    const direct = { '@context': { xsd: 'http://www.w3.org/2001/XMLSchema#' } };
    const viaYaml = { '@context': { xsd: 'http://www.w3.org/2001/XMLSchema' } };
    expect(compareInstanceTrip(direct, viaYaml).map((d) => d.family)).toEqual([null]);
  });

  it('reports an ontology moved to a different acronym', () => {
    const at = (uri: string) => ({ _valueConstraints: { ontologies: [{ uri }] } });
    const differences = compareSchemaTrip(
      at('http://data.bioontology.org/ontologies/OBI'),
      at('https://data.bioontology.org/ontologies/OBO'),
    );
    expect(differences.map((d) => d.family)).toEqual([null]);
  });
});
