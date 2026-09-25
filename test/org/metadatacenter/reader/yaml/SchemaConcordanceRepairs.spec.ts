import {
  CedarBuilders,
  CedarReaders,
  CedarWriters,
  ControlledTermActionBuilder,
  ControlledTermDefaultValueBuilder,
  BioportalTermType,
  Iri,
} from '../../../../../src';
import { parse } from 'yaml';

const readers = CedarReaders.yaml().getStrict();
const writers = CedarWriters.json().getStrict();
const base = 'type: text-field\nname: "Probe"\nmodelVersion: 1.6.0\n';
const jsonOf = (field: any) => JSON.parse(writers.getFieldWriterForField(field).getAsJsonString(field));

test('template provenance follows Java ordering regardless of input order', () => {
  const source = writers.getTemplateWriter().getAsJsonNode(CedarBuilders.templateBuilder().withSchemaName('Probe').build());
  source['pav:derivedFrom'] = 'https://example.org/source';
  source['pav:previousVersion'] = 'https://example.org/previous';
  const template = CedarReaders.json().getStrict().getTemplateReader().readFromObject(source).template;
  const yaml = CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(template);
  for (const model of [template, readers.getTemplateReader().readFromString(yaml).template]) {
    const output = writers.getTemplateWriter().getAsJsonNode(model);
    expect(output['pav:previousVersion']).toBe(source['pav:previousVersion']);
    expect(output['pav:derivedFrom']).toBe(source['pav:derivedFrom']);
    expect(Object.keys(output).indexOf('pav:previousVersion')).toBeLessThan(Object.keys(output).indexOf('pav:derivedFrom'));
  }
});

test('element provenance follows Java ordering regardless of input order', () => {
  const source = writers.getTemplateElementWriter().getAsJsonNode(CedarBuilders.templateElementBuilder().withSchemaName('Probe').build());
  source['pav:derivedFrom'] = 'https://example.org/source';
  source['pav:previousVersion'] = 'https://example.org/previous';
  const template = CedarReaders.json().getStrict().getTemplateElementReader().readFromObject(source).element;
  const yaml = CedarWriters.yaml().getStrict().getTemplateElementWriter().getAsYamlString(template);
  for (const model of [template, readers.getTemplateElementReader().readFromString(yaml).element]) {
    const output = writers.getTemplateElementWriter().getAsJsonNode(model);
    expect(output['pav:previousVersion']).toBe(source['pav:previousVersion']);
    expect(output['pav:derivedFrom']).toBe(source['pav:derivedFrom']);
    expect(Object.keys(output).indexOf('pav:previousVersion')).toBeLessThan(Object.keys(output).indexOf('pav:derivedFrom'));
  }
});

test.each(['text-field', 'static-rich-text'])('root %s defaults match Java for both formats; explicit metadata survives', (type) => {
  for (const metadata of ['', 'version: 2.3.4\nstatus: published\n']) {
    const field = readers.getTemplateFieldReader().readFromString(base.replace('text-field', type) + metadata).field;
    const json = jsonOf(field);
    expect(Object.keys(json).indexOf('pav:version')).toBeLessThan(Object.keys(json).indexOf('schema:schemaVersion'));
    expect(json['pav:version']).toBe(metadata ? '2.3.4' : '0.0.1');
    expect(json['bibo:status']).toBe(metadata ? 'bibo:published' : 'bibo:draft');
    if (!metadata) {
      delete json['pav:version'];
      delete json['bibo:status'];
    }
    const fromJson = CedarReaders.json().getStrict().getTemplateFieldReader().readFromObject(json).field;
    expect(jsonOf(fromJson)['pav:version']).toBe(metadata ? '2.3.4' : '0.0.1');
    expect(jsonOf(fromJson)['bibo:status']).toBe(metadata ? 'bibo:published' : 'bibo:draft');
  }
});

test('nested metadata stays absent and child configuration follows Java ordering', () => {
  const yaml =
    'type: template\nname: "Probe"\nmodelVersion: 1.6.0\nchildren:\n' +
    '  - key: "text"\n    type: text-field\n    name: "Text"\n    modelVersion: 1.6.0\n' +
    '    configuration:\n      hidden: true\n      required: true\n      recommended: true\n';
  const template = readers.getTemplateReader().readFromString(yaml).template;
  const json = writers.getTemplateWriter().getAsJsonNode(template);
  const reread = CedarReaders.json().getStrict().getTemplateReader().readFromObject(json).template;
  const output = CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(reread);
  const child = parse(output).children[0];
  expect(child).not.toHaveProperty('version');
  expect(child).not.toHaveProperty('status');
  expect(Object.keys(child.configuration).slice(0, 3)).toEqual(['required', 'hidden', 'recommended']);
});

test('literal constraints and provenance follow Java JSON ordering', () => {
  const field = CedarBuilders.textFieldBuilder()
    .withSchemaName('Probe')
    .withMinLength(1)
    .withMaxLength(10)
    .withDefaultValue('text')
    .build();
  const source = jsonOf(field);
  source['pav:derivedFrom'] = 'https://example.org/source';
  source['pav:previousVersion'] = 'https://example.org/previous';
  const output = jsonOf(CedarReaders.json().getStrict().getTemplateFieldReader().readFromObject(source).field);
  expect(Object.keys(output['_valueConstraints'])).toEqual(['minLength', 'maxLength', 'defaultValue', 'requiredValue']);
  expect(Object.keys(output).indexOf('pav:previousVersion')).toBeLessThan(Object.keys(output).indexOf('pav:derivedFrom'));
});

test.each([null, 0])('controlled-term default and action follow Java JSON ordering with destination %s', (to) => {
  const uri = new Iri('https://example.org/term');
  const action = new ControlledTermActionBuilder()
    .withTermUri(uri)
    .withSource('TEST')
    .withType(BioportalTermType.ONTOLOGY_CLASS)
    .withAction(to === null ? 'delete' : 'move')
    .withSourceUri(new Iri('https://example.org/source'))
    .withTo(to)
    .build();
  const field = CedarBuilders.controlledTermFieldBuilder()
    .withSchemaName('Probe')
    .withDefaultValue(new ControlledTermDefaultValueBuilder().withTermUri(uri).withRdfsLabel('Term').build())
    .addAction(action)
    .build();
  const constraints = jsonOf(field)['_valueConstraints'];
  expect(Object.keys(constraints.defaultValue)).toEqual(['termUri', 'rdfs:label']);
  expect(Object.keys(constraints.actions[0])).toEqual(['termUri', 'source', 'type', 'action', 'sourceUri', ...(to === null ? [] : ['to'])]);
});

test.each(['template', 'element'])('%s JSON text retains numeric child names in model order', (kind) => {
  const yaml = `type: ${kind}\nname: "Order probe"\nmodelVersion: 1.6.0\nchildren:\n  - key: "First"\n    type: text-field\n    modelVersion: 1.6.0\n    name: "First"\n    propertyIri: "https://example.org/first"\n  - key: "11"\n    type: text-field\n    modelVersion: 1.6.0\n    name: "Numeric name"\n    propertyIri: "https://example.org/number"\n  - key: "Last"\n    type: text-field\n    modelVersion: 1.6.0\n    name: "Last"\n    propertyIri: "https://example.org/last"\n`;
  const model = kind === 'template' ? readers.getTemplateReader().readFromString(yaml).template : readers.getTemplateElementReader().readFromString(yaml).element;
  const writer: any = kind === 'template' ? writers.getTemplateWriter() : writers.getTemplateElementWriter();
  const text = writer.getAsJsonString(model);
  const node = writer.getAsJsonNode(model);
  expect(JSON.parse(text)).toEqual(node);
  expect(() => structuredClone(node)).not.toThrow();
  // Every map containing the three child keys must retain their declared order in the text.
  const childKeys = [...text.matchAll(/^\s*"(First|11|Last)":/gm)].map((match) => match[1]);
  expect(childKeys.length).toBeGreaterThanOrEqual(6);
  for (let i = 0; i < childKeys.length; i += 3) expect(childKeys.slice(i, i + 3)).toEqual(['First', '11', 'Last']);
});
