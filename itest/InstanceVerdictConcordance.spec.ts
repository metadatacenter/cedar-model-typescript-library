import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import {
  InstanceValidationOptions,
  InstanceValidator,
  JsonNode,
  JsonSourcePolicy,
  JsonTemplateInstanceReader,
  JsonTemplateReader,
} from '../src';

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
    patch?: { instance?: Operation[]; template?: Operation[]; stored?: Operation[] };
    completion?: Operation[];
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
  'cee-suite/008#annotation-null-value':
    "The template's annotation schema and the Java validator admit a null literal annotation, which neither library's model reads.",
};

// The editor reads a stored template with the FEBRUARY_2024 behavior, and an instance with the strict
// reader, falling back to FEBRUARY_2024 where the strict reader refuses it, and it judges the instance
// against the stored template as the server does. An instance neither reader accepts cannot be opened,
// so it cannot be saved either.
function canSave(document: () => JsonNode, template: JsonNode, options: InstanceValidationOptions = {}): boolean {
  const model = JsonTemplateReader.getFebruary2024().readFromObject(template).template;
  const read = (() => {
    try {
      const strict = JsonTemplateInstanceReader.getStrict().readFromObject(document());
      return strict.parsingResult.wasSuccessful() ? strict : JsonTemplateInstanceReader.getFebruary2024().readFromObject(document());
    } catch {
      return null;
    }
  })();
  return read !== null && InstanceValidator.validateReport(read.instance, model, template, options).canSave;
}

// Java judged each instance as the server stores it from an editor's save, which supplies the identity,
// provenance and element-occurrence identifiers an editor's document lacks. So the instance as the
// editor holds it is judged as the editor's save is, leaving those to the server, and the completed
// document is judged as a verbatim write would store it. A case with a `patch` is a corpus case changed
// into a probe shape the corpus does not hold; a stored probe changes the completed document, the shape
// only a verbatim write can store, and is judged verbatim alone.
const saved = corpus.cases.filter((c) => c.patch?.stored === undefined);
test.each(saved)('$id: Save follows the Java verdict', ({ id, instance, template, patch, javaValid }) => {
  const stored = patched(source(template), patch?.template);
  expect(canSave(() => patched(source(instance), patch?.instance), stored)).toBe(id in OPEN_DEFECTS ? !javaValid : javaValid);
});

test.each(corpus.cases)('$id: a verbatim write follows the Java verdict', ({ id, instance, template, patch, completion, javaValid }) => {
  const stored = patched(source(template), patch?.template);
  const document = (): JsonNode => patched(patched(patched(source(instance), patch?.instance), completion), patch?.stored);
  expect(canSave(document, stored, { verbatim: true })).toBe(id in OPEN_DEFECTS ? !javaValid : javaValid);
});

test('lists only cases the corpus holds', () => {
  const ids = new Set(corpus.cases.map((c) => c.id));
  expect(Object.keys(OPEN_DEFECTS).filter((id) => !ids.has(id))).toEqual([]);
});
