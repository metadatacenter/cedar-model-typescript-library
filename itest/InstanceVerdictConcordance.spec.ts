import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { JsonNode } from '../src';
import { corpusDocument, editorCanSave, editorInstance, editorWrite, Operation, patched } from './EditorSave';

// The Java validator's verdict on every corpus instance, recorded by cedar-development's
// ops/cedar_corpus_instance_verdicts.py from cedar-model-validation-library. The server applies that
// verdict to a write and the embeddable editor's Save follows this library's, so the two must agree
// on every case: an instance the server would store can be saved, and one it would refuse cannot.
// Each case also carries the document the editor's save writes and the Java verdict on that document.
const bytes = readFileSync(join(__dirname, 'resources/concordance/instance-verdicts.json'));
const corpus = JSON.parse(bytes.toString()) as {
  cases: {
    id: string;
    instance: string;
    template: string;
    patch?: { instance?: Operation[]; template?: Operation[]; stored?: Operation[] };
    completion?: Operation[];
    javaValid: boolean;
    written?: { document: JsonNode; javaValid: boolean; javaErrors: string[] } | null;
  }[];
};
const artifacts = join(__dirname, '..', 'cedar-test-artifacts', 'artifacts');
const source = (relative: string): JsonNode => corpusDocument(artifacts, relative);

test('pins the instance verdicts to the Java validator and the shared corpus', () => {
  const lock = JSON.parse(readFileSync(join(__dirname, 'resources/concordance/instance-verdicts-lock.json'), 'utf8'));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(corpus.cases).toHaveLength(lock.caseCount);
  expect(lock.javaCommit).toMatch(/^[a-f0-9]{40}$/);
  expect(lock.corpusCommit).toMatch(/^[a-f0-9]{40}$/);
});

// Cases on which this library still reaches a different verdict, by the judgement that differs. Each is
// a defect here, not an accepted variation: a case listed must still disagree in the judgements named,
// so fixing one fails this spec until its entry is removed, and every case not listed must agree.
type Judgement = 'save' | 'verbatim' | 'asWritten' | 'write';
const OPEN_DEFECTS: Record<string, { judgements: Judgement[]; reason: string }> = {
  'cee-suite/017#label-null-required': {
    judgements: ['write'],
    reason: 'The writer drops the null rdfs:label the template requires, so the server refuses the written document.',
  },
  'cee-suite/021#absent': {
    judgements: ['asWritten'],
    reason: 'asWritten reports a missing child that the inflated write supplies, and the server stores that document.',
  },
};
const expected = (id: string, judgement: Judgement, javaValid: boolean): boolean =>
  OPEN_DEFECTS[id]?.judgements.includes(judgement) === true ? !javaValid : javaValid;

// Java judged each instance as the server stores it from an editor's save, which supplies the identity,
// provenance and element-occurrence identifiers an editor's document lacks. So the instance as the
// editor holds it is judged as the editor's save is, leaving those to the server, and the completed
// document is judged as a verbatim write would store it. A case with a `patch` is a corpus case changed
// into a probe shape the corpus does not hold; a stored probe changes the completed document, the shape
// only a verbatim write can store, and is judged verbatim alone.
const saved = corpus.cases.filter((c) => c.patch?.stored === undefined);
test.each(saved)('$id: Save follows the Java verdict', ({ id, instance, template, patch, javaValid }) => {
  const stored = patched(source(template), patch?.template);
  expect(editorCanSave(patched(source(instance), patch?.instance), stored)).toBe(expected(id, 'save', javaValid));
});

test.each(corpus.cases)('$id: a verbatim write follows the Java verdict', ({ id, instance, template, patch, completion, javaValid }) => {
  const stored = patched(source(template), patch?.template);
  const document = patched(patched(patched(source(instance), patch?.instance), completion), patch?.stored);
  expect(editorCanSave(document, stored, { verbatim: true })).toBe(expected(id, 'verbatim', javaValid));
});

// The editor judges the instance it holds as the document its save would write (`asWritten`), and the
// server judges that document, so the editor's Save must follow the Java verdict on it. The document is
// compared first: a writer that has changed since the verdicts were recorded fails here, rather than
// leaving the gate to compare a verdict with a document the validator never judged. An instance the
// editor cannot open or write has no document, and cannot be saved.
test.each(saved)(
  "$id: the editor's Save follows the Java verdict on the document it writes",
  ({ id, instance, template, patch, written }) => {
    expect(written).toBeDefined();
    const stored = patched(source(template), patch?.template);
    const document = patched(source(instance), patch?.instance);
    expect(editorWrite(document, stored)).toEqual(written?.document ?? null);
    expect(editorCanSave(document, stored, { asWritten: true })).toBe(written ? expected(id, 'asWritten', written.javaValid) : false);
  },
);

// The editor's write must not turn an instance the server would store into one it refuses.
const openable = saved.filter((c) => c.javaValid && editorInstance(patched(source(c.instance), c.patch?.instance)) !== null);
test.each(openable)("$id: the editor's write keeps a valid instance valid", ({ id, written }) => {
  expect(written?.javaValid ?? false).toBe(expected(id, 'write', true));
});

test('lists only cases the corpus holds, each with the judgements that differ', () => {
  const ids = new Set(corpus.cases.map((c) => c.id));
  expect(Object.keys(OPEN_DEFECTS).filter((id) => !ids.has(id))).toEqual([]);
  expect(Object.entries(OPEN_DEFECTS).filter(([, entry]) => entry.judgements.length === 0 || !entry.reason)).toEqual([]);
});
