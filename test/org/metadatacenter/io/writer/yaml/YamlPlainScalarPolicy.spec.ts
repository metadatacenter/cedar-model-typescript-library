import YAML from 'yaml';
import { SimpleYamlSerializer } from '../../../../../../src/org/metadatacenter/io/writer/yaml/SimpleYamlSerializer';
import { yamlPlainScalarFields } from '../../../../../../src/org/metadatacenter/io/writer/yaml/YamlPlainScalarPolicy';
import { YamlValues } from '../../../../../../src/org/metadatacenter/model/cedar/constants/YamlValues';
import { BioportalTermTypeYamlValues } from '../../../../../../src/org/metadatacenter/model/cedar/types/bioportal-types/BioportalTermType';
import { BiboStatusYamlValues } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/BiboStatus';
import { NumberTypeValues } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/NumberType';
import { TemporalGranularityValues } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/TemporalGranularity';
import { TemporalTypeValues } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/TemporalType';
import { TimeFormatValues } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/TimeFormat';
import { YamlArtifactTypeValues } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/YamlArtifactType';
import { JsonNode } from '../../../../../../src/org/metadatacenter/model/cedar/types/basic-types/JsonNode';

const members: ReadonlyArray<readonly [string, string]> = [
  ...[
    ...Object.values(YamlArtifactTypeValues),
    'element-instance',
    YamlValues.Controlled.class,
    BioportalTermTypeYamlValues.VALUE,
    YamlValues.Controlled.ontology,
    YamlValues.Controlled.branch,
    YamlValues.Controlled.valueSet,
  ].map((value) => ['type', value] as const),
  ...['0.0.0', '1.6.0', '2147483647.2147483647.2147483647'].flatMap((value) => [
    ['version', value] as const,
    ['modelVersion', value] as const,
  ]),
  ...Object.values(BiboStatusYamlValues).map((value) => ['status', value] as const),
  ...['xsd:string', 'xsd:anyUri', ...Object.values(TemporalTypeValues), ...Object.values(NumberTypeValues), YamlValues.iri].map(
    (value) => ['datatype', value] as const,
  ),
  ...['move', 'delete'].map((value) => ['action', value] as const),
  ...Object.values(TemporalGranularityValues).map((value) => ['granularity', value] as const),
  ...Object.values(BioportalTermTypeYamlValues).map((value) => ['termType', value] as const),
  ...Object.values(TimeFormatValues).map((value) => ['inputTimeFormat', value] as const),
];

describe('the CEDAR-owned YAML plain-scalar policy', () => {
  test('contains exactly the nine structural fields', () => {
    expect(yamlPlainScalarFields).toEqual(
      new Set(['type', 'modelVersion', 'status', 'version', 'datatype', 'action', 'granularity', 'termType', 'inputTimeFormat']),
    );
  });

  test.each(members)('%s: %s is plain and returns as a string', (field, value) => {
    const yaml = SimpleYamlSerializer.serialize({ [field]: value } as JsonNode);

    expect(yaml).toBe(`${field}: ${value}\n`);
    expect(YAML.parse(yaml)[field]).toBe(value);
    expect(typeof YAML.parse(yaml)[field]).toBe('string');
  });

  test.each([
    ['sourceSystem', 'bioportal'],
    ['id', 'https://repo.metadatacenter.org/templates/example'],
    ['createdOn', '2026-08-18T08:00:00-07:00'],
    ['language', 'no'],
    ['type', 'object'],
    ['type', 'no'],
    ['status', 'archived'],
    ['datatype', 'xsd:integer'],
    ['action', 'replace'],
    ['granularity', 'week'],
    ['termType', 'ontology'],
    ['inputTimeFormat', 'am/pm'],
    ['version', '1.0'],
    ['modelVersion', '1.6.0-rc1'],
  ])('%s: %s remains quoted', (field, value) => {
    expect(SimpleYamlSerializer.serialize({ [field]: value } as JsonNode)).toBe(`${field}: "${value}"\n`);
  });

  test('applies at nested and sequence mapping positions without changing open strings', () => {
    const yaml = SimpleYamlSerializer.serialize({
      type: 'template',
      name: 'published',
      children: [
        {
          type: 'temporal-field',
          name: '12h',
          configuration: { granularity: 'second', inputTimeFormat: '12h' },
        },
      ],
    } as JsonNode);

    expect(yaml).toBe(
      'type: template\n' +
        'name: "published"\n' +
        'children:\n' +
        '  - type: temporal-field\n' +
        '    name: "12h"\n' +
        '    configuration:\n' +
        '      granularity: second\n' +
        '      inputTimeFormat: 12h\n',
    );
  });
});
