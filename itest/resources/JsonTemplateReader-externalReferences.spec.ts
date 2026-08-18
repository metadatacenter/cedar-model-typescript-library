import * as fs from 'node:fs';
import * as path from 'node:path';
import { CedarReaders, CedarWriters, JsonArtifactParsingResult } from '../../src';
import { EXTERNAL_TEMPLATE_DIAGNOSTICS, diagnosticsFor } from './compatibilityExpectations';

const REFERENCE_ROOT = path.resolve(__dirname, '../../cedar-artifact-library/src/test/resources/templates');

const referenceFiles = (directory: string): string[] =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolute = path.join(directory, entry.name);
      return entry.isDirectory() ? referenceFiles(absolute) : [absolute];
    })
    .filter((file) => file.endsWith('.json'))
    .sort();

const files = referenceFiles(REFERENCE_ROOT).map((file) => [path.relative(REFERENCE_ROOT, file), file] as const);

const diagnostics = (result: JsonArtifactParsingResult): { errors: number; warnings: number } => ({
  errors: result.getBlueprintComparisonErrorCount(),
  warnings: result.getBlueprintComparisonWarningCount(),
});

describe('vendored Java reference-template compatibility', () => {
  it('contains the complete pinned inventory', () => {
    expect(files).toHaveLength(93);
  });

  test.each(files)('%s has only its declared compatibility diagnostics', (relativeName, file) => {
    const result = CedarReaders.json().getFebruary2024().getTemplateReader().readFromString(fs.readFileSync(file, 'utf8'));

    expect(diagnostics(result.parsingResult)).toStrictEqual(diagnosticsFor(EXTERNAL_TEMPLATE_DIAGNOSTICS, relativeName));

    const emitted = CedarWriters.json().getFebruary2024().getTemplateWriter().getAsJsonNode(result.template);
    expect(Object.keys(emitted).length).toBeGreaterThan(0);
  });

  it('has no stale diagnostic declaration', () => {
    const present = new Set(files.map(([relativeName]) => relativeName));
    expect(Object.keys(EXTERNAL_TEMPLATE_DIAGNOSTICS).filter((name) => !present.has(name))).toStrictEqual([]);
  });
});
