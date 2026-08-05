import * as fs from 'node:fs';
import * as path from 'node:path';
import { CedarReaders } from '../../../../../../src';

/**
 * Every template CEDAR has served can be read.
 *
 * The blueprint describes what the library writes today. The shared corpus holds
 * templates CEDAR served between 2018 and 2024, and 23 of the 123 differ from
 * that blueprint — an `@context` whose `additionalProperties` permits further
 * URI entries rather than pinning `false`, a context predating the `bibo`
 * prefix, `_ui.propertyDescriptions` from before that key existed, an
 * attribute-value field without its context `enum`.
 *
 * None of those is a broken document. They are what CEDAR emitted at the time,
 * they are still in circulation, and a reader that rejects them cannot open data
 * that demonstrably exists. So under `FEBRUARY_2024` they are warnings, and the
 * document reads.
 *
 * `STRICT` is unchanged and still refuses all of them, which is the point of
 * having two behaviors. The difference is never discarded either way: a warning
 * stays retrievable through `getBlueprintComparisonWarnings`.
 */
const CORPUS = path.resolve(__dirname, '../../../../../../cedar-test-artifacts/artifacts');

/**
 * Deliberately broken, and named rather than filtered by a catch that would also
 * swallow a template going bad by accident.
 *
 *  - `cee-suite/086` is not valid JSON.
 *  - `templates/003` is malformed in its own right — its `_ui.order` disagrees
 *    with its own children, which is structural breakage rather than a form
 *    CEDAR once emitted.
 */
const DELIBERATE_FAILURES = ['cee-suite/086', 'templates/003'];

const templates = (): Array<[string, string]> => {
  if (!fs.existsSync(CORPUS)) {
    throw new Error(`the shared corpus is missing at ${CORPUS}; check out cedar-test-artifacts beside this repo`);
  }
  const found: Array<[string, string]> = [];
  for (const group of fs.readdirSync(CORPUS)) {
    const groupPath = path.join(CORPUS, group);
    if (!fs.statSync(groupPath).isDirectory()) continue;
    for (const entry of fs.readdirSync(groupPath)) {
      const entryPath = path.join(groupPath, entry);
      if (!fs.statSync(entryPath).isDirectory()) continue;
      const file = path.join(entryPath, `template-${entry}.json`);
      if (fs.existsSync(file) && !DELIBERATE_FAILURES.includes(`${group}/${entry}`)) {
        found.push([`${group}/${entry}`, file]);
      }
    }
  }
  return found.sort();
};

const all = templates();

describe('reading the shared template corpus', () => {
  it('finds templates to read', () => {
    expect(all.length).toBeGreaterThan(100);
  });

  it.each(all)('%s reads without error', (_name, file) => {
    const result = CedarReaders.json()
      .getFebruary2024()
      .getTemplateReader()
      .readFromObject(JSON.parse(fs.readFileSync(file, 'utf8'))).parsingResult;
    const detail = result
      .getBlueprintComparisonErrors()
      .map((e) => `${e.errorType.getValue()} at ${JSON.stringify(e.errorPath)}`)
      .join('; ');
    expect(detail).toBe('');
  });

  /**
   * The variations are recorded rather than waved through, so a caller wanting
   * the stricter reading does not have to parse the document twice to get it.
   */
  it('records the older forms as warnings rather than discarding them', () => {
    const warned = all.filter(([, file]) => {
      const result = CedarReaders.json()
        .getFebruary2024()
        .getTemplateReader()
        .readFromObject(JSON.parse(fs.readFileSync(file, 'utf8'))).parsingResult;
      return result.getBlueprintComparisonWarningCount() > 0;
    });
    expect(warned.length).toBeGreaterThan(15);
  });

  /**
   * If this ever reaches zero, the leniency has spread into STRICT and the two
   * behaviors have collapsed into one.
   */
  it('leaves STRICT strict', () => {
    const rejected = all.filter(([, file]) => {
      try {
        return (
          CedarReaders.json()
            .getStrict()
            .getTemplateReader()
            .readFromObject(JSON.parse(fs.readFileSync(file, 'utf8')))
            .parsingResult.getBlueprintComparisonErrorCount() > 0
        );
      } catch {
        return true;
      }
    });
    expect(rejected.length).toBeGreaterThan(15);
  });
});
