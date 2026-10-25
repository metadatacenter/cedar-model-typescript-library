import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { InstanceValidator, JsonNode, JsonSourcePolicy, JsonTemplateInstanceReader, JsonTemplateReader } from '../src';

// The Java validator's verdict on every corpus instance, recorded by cedar-development's
// ops/cedar_corpus_instance_verdicts.py from cedar-model-validation-library. The server applies that
// verdict to a write and the embeddable editor's Save follows this library's, so the two must agree
// on every case: an instance the server would store can be saved, and one it would refuse cannot.
const bytes = readFileSync(join(__dirname, 'resources/concordance/instance-verdicts.json'));
type Operation = { op: 'add' | 'remove'; path: string; value?: JsonNode };
const corpus = JSON.parse(bytes.toString()) as {
  cases: {
    id: string;
    instance: string;
    template: string;
    patch?: { instance?: Operation[]; template?: Operation[] };
    javaValid: boolean;
  }[];
};
const artifacts = join(__dirname, '..', 'cedar-test-artifacts', 'artifacts');

function source(relative: string): JsonNode {
  return JsonSourcePolicy.parse(readFileSync(join(artifacts, relative), 'utf8'));
}

/** The document with JSON Patch `add` and `remove` operations applied, as the generator applies them. */
function patched(document: JsonNode, operations: Operation[] = []): JsonNode {
  const copy = structuredClone(document) as Record<string, unknown>;
  for (const { op, path, value } of operations) {
    const keys = path
      .split('/')
      .slice(1)
      .map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'));
    const last = keys.pop() as string;
    const parent = keys.reduce((node, part) => node[part] as Record<string, unknown>, copy);
    if (op === 'remove') delete parent[last];
    else parent[last] = value;
  }
  return copy as JsonNode;
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
  'cee-suite/046': 'an attribute-value field lists an object where the schema allows only an attribute name',
  'cee-suite/021#context-prefix-missing':
    'the model writes the standard prefixes and term definitions of an instance @context itself, so it cannot see that a stored instance lacks one',
  'cee-suite/017#label-absent-required':
    'the model keeps a null rdfs:label as no label, so a slot without the rdfs:label its schema requires reads the same as one holding it as null',
};

// The editor reads a stored template with the FEBRUARY_2024 behavior, and an instance with the strict
// reader, falling back to FEBRUARY_2024 where the strict reader refuses it, and it judges the instance
// against the stored template as the server does. A case with a `patch` is a corpus case changed into a
// probe shape the corpus does not hold. An instance neither reader accepts cannot be opened, so it
// cannot be saved either.
test.each(corpus.cases)('$id: Save follows the Java verdict', ({ id, instance, template, patch, javaValid }) => {
  const stored = patched(source(template), patch?.template);
  const model = JsonTemplateReader.getFebruary2024().readFromObject(stored).template;
  const document = (): JsonNode => patched(source(instance), patch?.instance);
  const read = (() => {
    try {
      const strict = JsonTemplateInstanceReader.getStrict().readFromObject(document());
      return strict.parsingResult.wasSuccessful() ? strict : JsonTemplateInstanceReader.getFebruary2024().readFromObject(document());
    } catch {
      return null;
    }
  })();
  const canSave = read !== null && InstanceValidator.validateReport(read.instance, model, stored).canSave;
  expect(canSave).toBe(id in OPEN_DEFECTS ? !javaValid : javaValid);
});

test('lists only cases the corpus holds', () => {
  const ids = new Set(corpus.cases.map((c) => c.id));
  expect(Object.keys(OPEN_DEFECTS).filter((id) => !ids.has(id))).toEqual([]);
});
