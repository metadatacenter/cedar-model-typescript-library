import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { JsonNode, ValidationPolicy } from '../src';
import { corpusDocument, editorCanSave, editorInstance, editorReport, editorWrite, Operation, patched } from './EditorSave';

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
    instanceSha256: string;
    templateSha256: string;
    javaValid: boolean;
    javaLocations: string[];
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
  // The verdicts judged the corpus this repository vendors, which the Java compatibility lock names.
  const vendored = JSON.parse(readFileSync(join(__dirname, 'resources/javaArtifactLibraryLock.json'), 'utf8'));
  expect(lock.corpusCommit).toBe(vendored.sharedCorpus.gitCommit);
});

test('judges the corpus files Java judged, byte for byte', () => {
  const digest = (relative: string): string =>
    createHash('sha256')
      .update(readFileSync(join(artifacts, relative)))
      .digest('hex');
  const changed = corpus.cases.filter((c) => digest(c.instance) !== c.instanceSha256 || digest(c.template) !== c.templateSha256);
  expect(changed.map((c) => c.id)).toEqual([]);
});

// The recorder's pairing: every instance in a case directory with a template beside it, the first
// template by name, neither a generated file nor anything but a JSON object.
function corpusPairs(): string[] {
  const isObject = (file: string): boolean => {
    try {
      const value: unknown = JSON.parse(readFileSync(file, 'utf8'));
      return value !== null && typeof value === 'object' && !Array.isArray(value);
    } catch {
      return false;
    }
  };
  const directories = (root: string): string[] =>
    readdirSync(root)
      .sort()
      .filter((name) => statSync(join(root, name)).isDirectory());
  const pairs: string[] = [];
  for (const kind of directories(artifacts)) {
    for (const name of directories(join(artifacts, kind))) {
      const files = readdirSync(join(artifacts, kind, name)).sort();
      const usable = (prefix: string) =>
        files.filter(
          (file) =>
            file.startsWith(prefix) && file.endsWith('.json') && !file.includes('generated') && isObject(join(artifacts, kind, name, file)),
        );
      const [template] = usable('template-');
      if (template === undefined) continue;
      for (const instance of usable('instance-')) pairs.push(`${kind}/${name}/${instance} ${kind}/${name}/${template}`);
    }
  }
  return pairs;
}

test('holds a case for every instance in the corpus that has its template beside it', () => {
  const recorded = corpus.cases.filter((c) => !c.id.includes('#')).map((c) => `${c.instance} ${c.template}`);
  expect(recorded.sort()).toEqual(corpusPairs().sort());
});

// Cases on which this library still reaches a different verdict, by the judgement that differs. Each is
// a defect here, not an accepted variation: a case listed must still disagree in the judgements named,
// so fixing one fails this spec until its entry is removed, and every case not listed must agree.
type Judgement = 'save' | 'verbatim' | 'asWritten' | 'write';
const OPEN_DEFECTS: Record<string, { judgements: Judgement[]; reason: string }> = {};
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

// Where both refuse an instance, they must refuse it for the same thing: some blocking finding of this
// library's must lie at, above or below a place Java's validator reports, or two different defects
// could pass for agreement. An instance the editor cannot open is refused by its reader, not here.
const overlaps = (path: string, location: string): boolean =>
  path === location || (path !== '' && location !== '' && (path.startsWith(location + '/') || location.startsWith(path + '/')));
test.each(corpus.cases.filter((c) => !c.javaValid && !(c.id in OPEN_DEFECTS)))(
  '$id: refuses where Java refuses',
  ({ instance, template, patch, completion, javaLocations }) => {
    const stored = patched(source(template), patch?.template);
    const document =
      patch?.stored === undefined
        ? patched(source(instance), patch?.instance)
        : patched(patched(patched(source(instance), patch?.instance), completion), patch.stored);
    const report = editorReport(document, stored, patch?.stored === undefined ? {} : { verbatim: true });
    if (report === null) return expect(editorInstance(document)).toBeNull();
    const blocking = report.findings.filter((finding) => ValidationPolicy.blocksSave(finding, 'instance')).map((finding) => finding.path);
    expect(blocking.filter((path) => javaLocations.some((location) => overlaps(path, location)))).not.toEqual([]);
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
