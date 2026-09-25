/**
 * Run with a Java 17 runtime and the built Java artifact library's classpath:
 * npx ts-node itest/scripts/verify-yaml-escapes.ts /path/to/classpath.txt
 * Jest separately checks these Java-generated spellings and TypeScript preservation.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import { SimpleYamlSerializer } from '../../src/org/metadatacenter/io/writer/yaml/SimpleYamlSerializer';
import { JsonNode } from '../../src/org/metadatacenter/model/cedar/types/basic-types/JsonNode';

if (!process.argv[2]) throw new Error('Supply the Java artifact library classpath file');
const fixtures: { value: string; javaYaml: string }[] = JSON.parse(
  readFileSync(join(__dirname, '../../test/org/metadatacenter/io/writer/yaml/fixtures/java-escaped-scalars.json'), 'utf8'),
);
const rows = fixtures.map(({ value, javaYaml }) => {
  const tsYaml = SimpleYamlSerializer.serialize({ description: value } as JsonNode);
  const tsKeyYaml = SimpleYamlSerializer.serialize({ [value]: value } as JsonNode);
  if (YAML.parse(javaYaml).description !== value || YAML.parse(tsYaml).description !== value || YAML.parse(tsKeyYaml)[value] !== value)
    throw new Error('TypeScript changed a probe');
  return { value, tsYaml, tsKeyYaml };
});
process.stdout.write(execFileSync('java', ['-cp', readFileSync(process.argv[2], 'utf8').trim(), join(__dirname, 'VerifyYamlEscapes.java')], {
  input: JSON.stringify(rows), encoding: 'utf8',
}));
