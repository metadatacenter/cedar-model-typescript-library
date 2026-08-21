import YAML from 'yaml';
import { SimpleYamlSerializer } from '../../../../../../src/org/metadatacenter/io/writer/yaml/SimpleYamlSerializer';
import { JsonNode } from '../../../../../../src/org/metadatacenter/model/cedar/types/basic-types/JsonNode';

// Every string a CEDAR artifact can hold has to come back as the string it was. A YAML writer decides
// per scalar how to write it, and a wrong answer does not fail at the writer: what comes back is a
// number, a boolean, a date, or nothing at all.
//
// The corpus below is adversarial rather than realistic — the spellings the YAML 1.1 and 1.2 resolvers
// claim, the indicators in every position, whitespace and control characters, the shapes CEDAR writes,
// and pseudorandom mixtures of all of it. It is generated from a fixed seed, so a failure names a
// reproducible string rather than a lucky one. The Java library carries the same property over its own
// corpus in YamlScalarRoundTripTest.

function generateProbes(): string[] {
  const probes = new Set<string>();

  const resolverTokens = [
    'y',
    'Y',
    'n',
    'N',
    'yes',
    'Yes',
    'YES',
    'yEs',
    'no',
    'No',
    'NO',
    'on',
    'On',
    'ON',
    'off',
    'Off',
    'OFF',
    'true',
    'True',
    'TRUE',
    'false',
    'False',
    'null',
    'Null',
    'NULL',
    '~',
    '',
    ' ',
    '  ',
    '0',
    '-0',
    '+0',
    '42',
    '-42',
    '007',
    '0755',
    '0o755',
    '0x1F',
    '-0x1F',
    '0b1010',
    '1_000',
    '3.14',
    '-3.14',
    '.5',
    '5.',
    '1e5',
    '1E5',
    '1e-5',
    '.inf',
    '-.inf',
    '.NaN',
    '.nan',
    'NaN',
    '1:30',
    '1:30:30',
    '12:30:00',
    '2024-09-06',
    '2024-09-06T10:03:57-07:00',
    '=',
    '-',
    '?',
    ':',
    '---',
    '...',
    '<<',
  ];
  resolverTokens.forEach((token) => probes.add(token));

  const indicators = ['-', '?', ':', ',', '[', ']', '{', '}', '#', '&', '*', '!', '|', '>', "'", '"', '%', '@', '`'];
  for (const indicator of indicators) {
    probes.add(indicator);
    probes.add(`${indicator}value`);
    probes.add(`${indicator} value`);
    probes.add(`value${indicator}`);
    probes.add(`value ${indicator}`);
    probes.add(`value${indicator}value`);
    probes.add(`value ${indicator} value`);
    probes.add(`a${indicator}b${indicator}c`);
  }

  const whitespace = [' ', '\t', '\n', '\r', '\r\n', ' ', '', ' ', '　', ''];
  for (const space of whitespace) {
    probes.add(space);
    probes.add(`a${space}b`);
    probes.add(`${space}ab`);
    probes.add(`ab${space}`);
    probes.add(`a${space}${space}b`);
    probes.add(`line1${space}line2 with more text`);
  }

  const realistic = [
    'this is my template',
    'Study Name',
    'https://repo.metadatacenter.org/templates/7b8977e',
    'http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#C101161',
    'xsd:decimal',
    '^[A-Z][^A-Z]*$',
    'Ulnar compound muscle action potential - CMAP - median [PhenX]',
    "the study's name",
    'a "quoted" word',
    'Yes',
    'No',
    'N/A',
    'Male/Female',
    '10 mg/kg',
    '50% ± 3',
    'C: drive',
    'key: value',
    'see [1], [2]',
    'paragraph one\n\nparagraph two',
    'trailing space \nnext line',
    'a 😀 b',
    'x'.repeat(200),
  ];
  realistic.forEach((text) => probes.add(text));

  // Pseudorandom mixtures from a fixed seed: a linear congruential generator rather than Math.random,
  // so the corpus is identical on every run.
  const alphabet = [
    'a',
    'Z',
    '0',
    '9',
    ' ',
    '\t',
    '-',
    ':',
    '#',
    ',',
    '[',
    ']',
    '{',
    '}',
    '"',
    "'",
    '*',
    '&',
    '!',
    '%',
    '@',
    '`',
    '|',
    '>',
    '?',
    '~',
    '.',
    '/',
    '\\',
    '\n',
    '=',
    '<',
    '+',
    'é',
    '中',
    ' ',
  ];
  let seed = 20260813;
  const next = (): number => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed;
  };
  for (let i = 0; i < 3000; i++) {
    const length = 1 + (next() % 12);
    let mixture = '';
    for (let j = 0; j < length; j++) {
      mixture += alphabet[next() % alphabet.length];
    }
    probes.add(mixture);
  }

  return [...probes];
}

const probes = generateProbes();

function describe_(text: string | undefined): string {
  return JSON.stringify(text);
}

describe('every scalar returns as the string it was', () => {
  test(`${probes.length} probe strings survive being written as a value and read back`, () => {
    const failures: string[] = [];
    for (const probe of probes) {
      const yaml = SimpleYamlSerializer.serialize({ v: probe } as JsonNode);
      let seen: unknown;
      try {
        seen = YAML.parse(yaml)?.v;
      } catch (error) {
        failures.push(`${describe_(probe)} could not be read: ${(error as Error).name}`);
        continue;
      }
      if (seen !== probe) {
        failures.push(`${describe_(probe)} came back as ${describe_(seen as string)}`);
      }
    }
    expect(failures.slice(0, 8)).toEqual([]);
    expect(failures.length).toBe(0);
  });

  test(`${probes.length} probe strings survive being written as a key and read back`, () => {
    const failures: string[] = [];
    for (const probe of probes) {
      const yaml = SimpleYamlSerializer.serialize({ [probe]: 'v' } as JsonNode);
      let seen: unknown;
      try {
        seen = Object.keys(YAML.parse(yaml) ?? {})[0];
      } catch (error) {
        failures.push(`${describe_(probe)} could not be read: ${(error as Error).name}`);
        continue;
      }
      if (seen !== probe) {
        failures.push(`${describe_(probe)} came back as ${describe_(seen as string)}`);
      }
    }
    expect(failures.slice(0, 8)).toEqual([]);
    expect(failures.length).toBe(0);
  });
});

describe('what the writer does with a spelling a reader would claim', () => {
  test.each([
    'yes',
    'No',
    'ON',
    'off',
    'true',
    '0x1F',
    '-0x1F',
    '0b1010',
    '0755',
    '1_000',
    '1e5',
    '-1e5',
    '.inf',
    '~',
    '42',
    '3.14',
    '12:30:00.5',
  ])('%s is quoted, so it comes back a string', (spelling: string) => {
    const yaml = SimpleYamlSerializer.serialize({ v: spelling } as JsonNode);
    expect(yaml).toContain(`"${spelling}"`);
    expect(YAML.parse(yaml).v).toBe(spelling);
  });
});
