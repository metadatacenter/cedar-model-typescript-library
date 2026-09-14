import fs from 'node:fs';
import path from 'node:path';
import { parse, stringify } from 'yaml';
import { CedarReaders, CedarWriters, YamlTemplateReader } from '../src';

// Java's InstanceTypesConformanceTest verifies this fixture against live readers,
// writers and the CEDAR schema validator. Include the sibling output when present.
const fixture = path.resolve(__dirname, '../itest/resources/concordance/java-instance-types.json');
const sibling = path.resolve(__dirname, '../../cedar-artifact-library/src/test/resources/concordance/instance-types.json');
if (fs.existsSync(sibling))
  test('shared instance-type conformance fixture matches Java', () => {
    expect(fs.readFileSync(fixture, 'utf8')).toBe(fs.readFileSync(sibling, 'utf8'));
  });
const cases = JSON.parse(fs.readFileSync(fixture, 'utf8')) as Array<{ count: number; json: any; yaml: any; compactYaml: any }>;
for (const entry of cases) {
  test(`${entry.count} instance types conform to Java JSON, full YAML and compact YAML`, () => {
    const template = CedarReaders.json().getStrict().getTemplateReader().readFromObject(entry.json).template;
    const expected = Array.from({ length: entry.count }, (_, i) => `urn:types:${i}`);
    expect(template.instanceTypeSpecifications).toEqual(expected);
    expect(template.getElement('Element')!.instanceTypeSpecifications).toEqual(expected);
    const jsonWriter = CedarWriters.json().getStrict().getTemplateWriter();
    expect(jsonWriter.getAsJsonNode(template)).toEqual(entry.json);
    for (const compact of [false, true]) {
      const expectedYaml = compact ? entry.compactYaml : entry.yaml;
      const yamlWriter = CedarWriters.yaml().getStrict().getTemplateWriter();
      const yaml = yamlWriter.getAsYamlString(template, compact);
      expect(parse(yaml)).toEqual(expectedYaml);
      const reader = compact ? YamlTemplateReader.getStrictForCompact() : YamlTemplateReader.getStrict();
      const restored = reader.readFromString(stringify(expectedYaml)).template;
      expect(restored.instanceTypeSpecifications).toEqual(expected);
      expect(restored.getElement('Element')!.instanceTypeSpecifications).toEqual(expected);
      expect(parse(yamlWriter.getAsYamlString(restored, compact))).toEqual(expectedYaml);
      if (!compact) expect(jsonWriter.getAsJsonNode(restored)).toEqual(entry.json);
    }
  });
}
