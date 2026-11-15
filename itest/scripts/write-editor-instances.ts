// Writes, for each case the instance verdict recorder names, the document the embeddable editor's save
// would write, so the Java validator can judge that document. Reads `{ corpus, cases }` as JSON on
// stdin, each case naming its instance and template in the corpus and the patch that makes it a probe,
// and prints `[{ id, written }]`, where `written` is null for an instance the editor cannot open or
// write. cedar-development's ops/cedar_corpus_instance_verdicts.py runs it.
import { readFileSync } from 'node:fs';
import { corpusDocument, editorWrite, Operation, patched } from '../EditorSave';

const { corpus, cases } = JSON.parse(readFileSync(0, 'utf8')) as {
  corpus: string;
  cases: { id: string; instance: string; template: string; patch?: { instance?: Operation[]; template?: Operation[] } }[];
};
const written = cases.map(({ id, instance, template, patch }) => ({
  id,
  written: editorWrite(
    patched(corpusDocument(corpus, instance), patch?.instance),
    patched(corpusDocument(corpus, template), patch?.template),
  ),
}));
process.stdout.write(JSON.stringify(written) + '\n');
