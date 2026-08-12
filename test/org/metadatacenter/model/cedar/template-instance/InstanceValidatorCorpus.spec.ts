import * as fs from 'node:fs';
import * as path from 'node:path';
import { CedarReaders, InstanceValidator } from '../../../../../../src';

/**
 * The validator against the shared corpus: it must not cry wolf.
 *
 * `InstanceValidator.spec.ts` proves each check fires on a document built to
 * break it. That is the easy half. The half that decides whether the verdict is
 * worth anything is this one — real template and instance pairs, written by
 * other tools, which should come back clean. A validator that reports errors
 * which are not errors is worse than one that stays quiet, because consumers
 * stop reading it.
 *
 * This caught two false positives while the checks were being written, both
 * from instance shapes the reader represents unobviously:
 *
 *  - an **attribute-value field**, whose instance form is a set of user-invented
 *    keys rather than a value node, was read as a container and failed the
 *    cardinality check. The template declares nothing to compare it against, so
 *    it is not checked at all now.
 *  - an **empty list**, which the reader returns as an
 *    `InstanceDataAttributeValueField` rather than an empty array, so every
 *    unfilled multi child looked like a cardinality mismatch.
 *
 * Ten of the fifty-six pairs failed before those were understood. Both are the
 * same underlying thing — the reader has no template, so it cannot always tell
 * which shape it is looking at — which is the whole reason this class exists.
 */
const CORPUS = path.resolve(__dirname, '../../../../../../cedar-test-artifacts/artifacts/cee-suite');

/**
 * `template-086.json` is not valid JSON. It is in the corpus deliberately, as a
 * malformed input, so it is named here rather than swallowed by a try/catch
 * that would also hide a pair going bad by accident.
 */
const UNPARSEABLE = ['086'];

/**
 * Pairs that genuinely do not conform, with the count they should report.
 *
 * These are findings, not exemptions. `002`'s template declares `minItems: 10`
 * on `Multi Text Field` and its instance carries two values, so the instance
 * does not satisfy its own template. Listing it keeps the suite honest about
 * what the corpus contains; if the corpus is corrected, this entry fails and
 * should be deleted.
 */
const KNOWN_NONCONFORMANT: Record<string, number> = {
  '002': 1,
};

const pairs = (): Array<[string, string, string]> => {
  if (!fs.existsSync(CORPUS)) {
    // Loud, not skipped. The corpus is committed to this repository and the
    // whole suite already depends on it — `pretest.js` reads it unguarded — so
    // its absence is a broken working copy, not a reason to pass quietly.
    throw new Error(`the corpus is missing at ${CORPUS}; it is committed to this repository, so the working copy is incomplete`);
  }
  return fs
    .readdirSync(CORPUS)
    .filter((entry) => /^\d+$/.test(entry))
    .sort()
    .map((entry) => [entry, path.join(CORPUS, entry, `template-${entry}.json`), path.join(CORPUS, entry, `instance-${entry}.json`)])
    .filter(([entry, template, instance]) => !UNPARSEABLE.includes(entry) && fs.existsSync(template) && fs.existsSync(instance)) as Array<
    [string, string, string]
  >;
};

const errorCount = (templateFile: string, instanceFile: string): { count: number; detail: string } => {
  const template = CedarReaders.json()
    .getFebruary2024()
    .getTemplateReader()
    .readFromObject(JSON.parse(fs.readFileSync(templateFile, 'utf8'))).template;
  const instance = CedarReaders.json()
    .getFebruary2024()
    .getTemplateInstanceReader()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .readFromObject(JSON.parse(fs.readFileSync(instanceFile, 'utf8')) as any, undefined as never).instance;

  const result = InstanceValidator.validate(instance, template);
  const detail = result
    .getBlueprintComparisonErrors()
    .map((error) => `${error.errorType.getValue()} at ${JSON.stringify(error.errorPath)}`)
    .join('; ');
  return { count: result.getBlueprintComparisonErrorCount(), detail };
};

describe('the validator over the shared corpus', () => {
  const all = pairs();

  it('finds pairs to check', () => {
    expect(all.length).toBeGreaterThan(50);
  });

  it.each(all)('%s conforms to its template', (entry, templateFile, instanceFile) => {
    const { count, detail } = errorCount(templateFile, instanceFile);
    const expected = KNOWN_NONCONFORMANT[entry] ?? 0;
    // Compared as a string so a failure prints which errors were reported;
    // jest's expect takes no message argument.
    expect(count === expected ? '' : `${count} error(s), expected ${expected}: ${detail}`).toBe('');
  });

  /**
   * The counterpart of the list above: an entry that starts conforming should
   * not sit here unnoticed, claiming a defect the corpus no longer has.
   */
  it('lists no conformant pair as non-conformant', () => {
    const stale = Object.keys(KNOWN_NONCONFORMANT).filter((entry) => {
      const found = all.find(([name]) => name === entry);
      return found !== undefined && errorCount(found[1], found[2]).count === 0;
    });
    // A non-empty array here names the entries to delete from KNOWN_NONCONFORMANT.
    expect(stale).toStrictEqual([]);
  });
});
