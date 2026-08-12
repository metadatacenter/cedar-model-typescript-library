import { readFileSync } from 'fs';
import * as path from 'path';

import { CedarJsonReaders, CedarWriters, JsonNode } from '../../../../../../src';
import { InstanceDataAttributeValueField } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataAttributeValueField';
import { InstanceDataStringAtom } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataStringAtom';

const fixture = (name: string): string => readFileSync(path.join(process.cwd(), 'test/resources/attribute-values', name), 'utf8');

const templateSource = fixture('two-fields-template.json');
const instanceSource = fixture('two-fields-instance.json');
const templateJson = JSON.parse(templateSource) as JsonNode;
const instanceJson = JSON.parse(instanceSource) as JsonNode;

const readers = CedarJsonReaders.getFebruary2024();
const writers = CedarWriters.json().getFebruary2024();

const expectedGroups: Record<string, Record<string, string>> = {
  'My AV Field 1': { A11: 'V11', A12: 'V12' },
  'My AV Field 2': { A21: 'V21', A22: 'V22' },
};

const fixtureContext = instanceJson['@context'] as JsonNode;
const expectedIris = Object.fromEntries(
  Object.values(expectedGroups)
    .flatMap((group) => Object.keys(group))
    .map((attributeName) => [attributeName, fixtureContext[attributeName] as string]),
);

const readInstance = (source: string) => readers.getTemplateInstanceReader().readFromString(source).instance;

const expectAttributeValueGroups = (source: string): void => {
  const container = readInstance(source).dataContainer;

  for (const [groupName, expectedValues] of Object.entries(expectedGroups)) {
    const group = container.values[groupName];
    expect(group).toBeInstanceOf(InstanceDataAttributeValueField);

    const attributeValueField = group as InstanceDataAttributeValueField;
    expect(Object.keys(attributeValueField.values)).toStrictEqual(Object.keys(expectedValues));
    for (const [attributeName, expectedValue] of Object.entries(expectedValues)) {
      expect((attributeValueField.values[attributeName] as InstanceDataStringAtom).value).toBe(expectedValue);
      expect(Object.hasOwn(container.values, attributeName)).toBe(false);
      expect(container.iris[attributeName]).toBe(expectedIris[attributeName]);
    }
  }
};

describe('two attribute-value fields from a production instance', () => {
  it('reads both template children as attribute-value fields', () => {
    const result = readers.getTemplateReader().readFromString(templateSource);

    expect(result.parsingResult.wasSuccessful()).toBe(true);
    expect(result.template.getChildrenInfo().getChildrenNames()).toStrictEqual(Object.keys(expectedGroups));
    for (const groupName of Object.keys(expectedGroups)) {
      expect(result.template.getChildInfo(groupName)?.uiInputType.getValue()).toBe('attribute-value');
    }

    const rendered = writers.getTemplateWriter().getAsJsonNode(result.template);
    const roundTripped = readers.getTemplateReader().readFromString(JSON.stringify(rendered)).template;
    expect(roundTripped.getChildrenInfo().getChildrenNames()).toStrictEqual(Object.keys(expectedGroups));
    for (const groupName of Object.keys(expectedGroups)) {
      expect(roundTripped.getChildInfo(groupName)?.uiInputType.getValue()).toBe('attribute-value');
    }
  });

  it('is based on the supplied template and folds each pair into the right group', () => {
    expect(instanceJson['schema:isBasedOn']).toBe(templateJson['@id']);
    expectAttributeValueGroups(instanceSource);
  });

  it('round-trips as JSON-LD without exposing model internals', () => {
    const rendered = writers.getTemplateInstanceWriter().getAsJsonNode(readInstance(instanceSource));

    for (const [groupName, expectedValues] of Object.entries(expectedGroups)) {
      expect(rendered[groupName]).toStrictEqual(Object.keys(expectedValues));
      for (const [attributeName, expectedValue] of Object.entries(expectedValues)) {
        expect(rendered[attributeName]).toStrictEqual({
          '@value': expectedValue,
        });
        expect((rendered['@context'] as JsonNode)[attributeName]).toBe(expectedIris[attributeName]);
      }
    }

    const renderedText = JSON.stringify(rendered);
    expect(renderedText).not.toContain('dataContainer');
    expect(renderedText).not.toContain('_values');
    expect(renderedText).not.toContain('_iris');
    expectAttributeValueGroups(renderedText);
  });
});
