import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { InstanceValidator, JsonNode, JsonSourcePolicy, JsonTemplateInstanceReader, JsonTemplateReader } from '../src';

// The Java validator's verdict on every corpus instance, recorded by cedar-development's
// ops/cedar_corpus_instance_verdicts.py from cedar-model-validation-library. The server applies that
// verdict to a write and the embeddable editor's Save follows this library's, so the two must agree
// on every case: an instance the server would store can be saved, and one it would refuse cannot.
const bytes = readFileSync(join(__dirname, 'resources/concordance/instance-verdicts.json'));
const corpus = JSON.parse(bytes.toString()) as {
  cases: { id: string; instance: string; template: string; replace?: { field: string; value: JsonNode }; javaValid: boolean }[];
};
const artifacts = join(__dirname, '..', 'cedar-test-artifacts', 'artifacts');

function source(relative: string): JsonNode {
  return JsonSourcePolicy.parse(readFileSync(join(artifacts, relative), 'utf8'));
}

test('pins the instance verdicts to the Java validator and the shared corpus', () => {
  const lock = JSON.parse(readFileSync(join(__dirname, 'resources/concordance/instance-verdicts-lock.json'), 'utf8'));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(corpus.cases).toHaveLength(lock.caseCount);
  expect(lock.javaCommit).toMatch(/^[a-f0-9]{40}$/);
  expect(lock.corpusCommit).toMatch(/^[a-f0-9]{40}$/);
});

// Cases on which this library still reaches a different verdict. Each is a defect here, not an
// accepted variation: a case listed must still disagree, so fixing one fails this spec until its entry
// is removed, and every case not listed must agree.
const OPEN_DEFECTS: Record<string, string> = {
  'cee-suite/016': 'the instance maps a field to a property IRI its template does not name, and InstanceValidator does not check @context',
  'cee-suite/046': 'an attribute-value field lists an object where the schema allows only an attribute name',
};

// The editor reads a stored template with the FEBRUARY_2024 behavior, and an instance with the strict
// reader, falling back to FEBRUARY_2024 where the strict reader refuses it. A case with a `replace` is
// a corpus instance with one field's value replaced by a probe shape the corpus does not hold. An
// instance neither reader accepts cannot be opened, so it cannot be saved either.
test.each(corpus.cases)('$id: Save follows the Java verdict', ({ id, instance, template, replace, javaValid }) => {
  const model = JsonTemplateReader.getFebruary2024().readFromObject(source(template)).template;
  const document = (): JsonNode => (replace ? { ...source(instance), [replace.field]: replace.value } : source(instance));
  const read = (() => {
    try {
      const strict = JsonTemplateInstanceReader.getStrict().readFromObject(document());
      return strict.parsingResult.wasSuccessful() ? strict : JsonTemplateInstanceReader.getFebruary2024().readFromObject(document());
    } catch {
      return null;
    }
  })();
  const canSave = read !== null && InstanceValidator.validateReport(read.instance, model).canSave;
  expect(canSave).toBe(id in OPEN_DEFECTS ? !javaValid : javaValid);
});

test('lists only cases the corpus holds', () => {
  const ids = new Set(corpus.cases.map((c) => c.id));
  expect(Object.keys(OPEN_DEFECTS).filter((id) => !ids.has(id))).toEqual([]);
});
