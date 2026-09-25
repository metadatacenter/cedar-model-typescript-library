import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { SimpleYamlSerializer } from '../../../../../../src/org/metadatacenter/io/writer/yaml/SimpleYamlSerializer';
import { yamlKeyNeedsQuoting } from '../../../../../../src/org/metadatacenter/io/writer/yaml/YamlPlainScalarPolicy';
import { JsonNode } from '../../../../../../src/org/metadatacenter/model/cedar/types/basic-types/JsonNode';

// Byte-identical copy of cedar-artifact-library/src/test/resources/yaml-key-quoting.json.
const cases: { key: string; quoted: boolean }[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../../../fixtures/yaml-key-quoting.json'), 'utf8'),
);
test.each(cases)('shared key policy: $key', ({ key, quoted }) => {
  expect(yamlKeyNeedsQuoting(key)).toBe(quoted);
  const text = SimpleYamlSerializer.serialize({ [key]: 'value' } as JsonNode);
  expect(text.startsWith('"')).toBe(quoted);
  for (const version of ['1.1', '1.2'] as const) {
    expect(YAML.parse(text, { version })).toEqual({ [key]: 'value' });
  }
});
