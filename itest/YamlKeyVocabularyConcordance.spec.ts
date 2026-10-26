import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { ChildDeploymentInfo, JsonNode, JsonPath } from '../src';
import { YamlSourcePolicy } from '../src/org/metadatacenter/io/reader/yaml/YamlSourcePolicy';
import { YamlKeyTracking } from '../src/org/metadatacenter/io/reader/yaml/YamlKeyTracking';
import { YamlTemplateReader } from '../src/org/metadatacenter/io/reader/yaml/YamlTemplateReader';
import { YamlTemplateElementReader } from '../src/org/metadatacenter/io/reader/yaml/YamlTemplateElementReader';
import { YamlTemplateFieldReader } from '../src/org/metadatacenter/io/reader/yaml/YamlTemplateFieldReader';
import { YamlTemplateInstanceReader } from '../src/org/metadatacenter/io/reader/yaml/YamlTemplateInstanceReader';

/**
 * The keys the Java library's YAML reader reads in each mapping of every corpus document, recorded
 * by cedar-artifact-library's CorpusYamlKeyVerifier, and this library's YAML reader held to the same
 * keys.
 *
 * Both readers refuse a key they do not read, so a document one accepts and the other refuses is a
 * place where the two read different keys. A reader also asks for keys a document does not hold, a
 * field type's optional settings say, so equal records mean the two accept the same keys at every
 * place the corpus reaches, not only the keys it states there.
 */
type Case = { file: string; compact: boolean; asked?: Record<string, string>; refused?: boolean };

const directory = join(__dirname, 'resources/concordance');
const bytes = readFileSync(join(directory, 'java-yaml-key-vocabulary.json'));
const record = JSON.parse(bytes.toString()) as { cases: Case[] };
const lock = JSON.parse(readFileSync(join(directory, 'java-yaml-key-vocabulary-lock.json'), 'utf8'));
const artifacts = join(__dirname, '..', 'cedar-test-artifacts', 'artifacts');

/** Read a tracked document with the reader for its type, in the form its file name gives. */
function read(document: JsonNode, compact: boolean): void {
  const type = YamlKeyTracking.untracked(() => document['type']);
  if (type === 'template') {
    (compact ? YamlTemplateReader.getStrictForCompact() : YamlTemplateReader.getStrict()).readFromObject(document);
  } else if (type === 'element') {
    (compact ? YamlTemplateElementReader.getStrictForCompact() : YamlTemplateElementReader.getStrict()).readFromObject(
      document,
      ChildDeploymentInfo.empty(),
      new JsonPath(),
    );
  } else if (type === 'instance') {
    (compact ? YamlTemplateInstanceReader.getStrictForCompact() : YamlTemplateInstanceReader.getStrict()).readFromObject(document);
  } else {
    (compact ? YamlTemplateFieldReader.getStrictForCompact() : YamlTemplateFieldReader.getStrict()).readFromObject(
      document,
      ChildDeploymentInfo.empty(),
      new JsonPath(),
    );
  }
}

test('pins the YAML key vocabulary to the Java reader', () => {
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(record.cases).toHaveLength(lock.caseCount);
  expect(lock.javaCommit).toMatch(/^[a-f0-9]{40}$/);
});

// A document the Java reader refuses for one of its values was read only as far as that value, so
// it has no record to compare with.
test.each(record.cases.filter((entry) => !entry.refused).map((entry): [string, Case] => [entry.file, entry]))(
  '%s: this reader reads the keys the Java reader reads, in every mapping',
  (_file: string, entry: Case) => {
    const document = YamlKeyTracking.track(YamlSourcePolicy.parse(readFileSync(join(artifacts, entry.file), 'utf8')));
    read(document, entry.compact);
    const asked = Object.fromEntries(
      Object.entries(YamlKeyTracking.askedKeys(document)).map(([pointer, keys]) => [pointer, keys.join(' ')]),
    );
    expect(asked).toEqual(entry.asked);
  },
);
