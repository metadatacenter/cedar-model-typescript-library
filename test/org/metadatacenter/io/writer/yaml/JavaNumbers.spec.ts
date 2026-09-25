import YAML from 'yaml';
import { SimpleYamlSerializer } from '../../../../../../src/org/metadatacenter/io/writer/yaml/SimpleYamlSerializer';
import { JsonNode } from '../../../../../../src/org/metadatacenter/model/cedar/types/basic-types/JsonNode';

describe('Java-compatible YAML numeric spelling', () => {
  test.each([
    [1e-7, '0.0000001'],
    [-1e-7, '-0.0000001'],
    [1.2345e-12, '0.0000000000012345'],
    [1e21, '1000000000000000000000'],
    [-1.25e21, '-1250000000000000000000'],
    [0, '0'],
    [12.5, '12.5'],
  ])('preserves %s with decimal spelling %s', (value, spelling) => {
    const yaml = SimpleYamlSerializer.serialize({ minValue: value } as JsonNode);
    expect(yaml).toBe(`minValue: ${spelling}\n`);
    expect(YAML.parse(yaml)).toEqual({ minValue: value });
  });

  test('retains numeric-looking strings as strings', () => {
    const yaml = SimpleYamlSerializer.serialize({ default: '1e-7' } as JsonNode);
    expect(YAML.parse(yaml)).toEqual({ default: '1e-7' });
  });
});
