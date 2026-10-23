import * as fs from 'node:fs';
import * as path from 'node:path';
import { CedarReaders, CedarWriters, JsonArtifactParsingResult } from '../../src';
import { EXTERNAL_TEMPLATE_DIAGNOSTICS, diagnosticsFor } from './compatibilityExpectations';

const FIELD = 'https://schema.metadatacenter.org/core/TemplateField';
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
    const source = fs.readFileSync(file, 'utf8');
    const readers = CedarReaders.json().getFebruary2024();
    const writers = CedarWriters.json().getFebruary2024();
    // One reference document is a field. A template reader refuses it, as Java's does, so it is read
    // as what it declares itself to be.
    const declared = (JSON.parse(source) as Record<string, unknown>)['@type'];
    if (declared === FIELD) {
      const result = readers.getTemplateFieldReader().readFromString(source);
      expect(diagnostics(result.parsingResult)).toStrictEqual(diagnosticsFor(EXTERNAL_TEMPLATE_DIAGNOSTICS, relativeName));
      expect(Object.keys(writers.getFieldWriterForField(result.field).getAsJsonNode(result.field)).length).toBeGreaterThan(0);
      return;
    }
    const result = readers.getTemplateReader().readFromString(source);

    expect(diagnostics(result.parsingResult)).toStrictEqual(diagnosticsFor(EXTERNAL_TEMPLATE_DIAGNOSTICS, relativeName));

    const emitted = writers.getTemplateWriter().getAsJsonNode(result.template);
    expect(Object.keys(emitted).length).toBeGreaterThan(0);
  });

  test('a field among them is refused by a template reader', () => {
    const field = files.find(([relativeName]) => relativeName === 'SampleFieldWithActions.json');
    expect(field).toBeDefined();
    const source = fs.readFileSync(field![1], 'utf8');
    expect(() => CedarReaders.json().getFebruary2024().getTemplateReader().readFromString(source)).toThrow(
      'Unexpected template schema artifact JSON-LD @type https://schema.metadatacenter.org/core/TemplateField',
    );
  });

  it('has no stale diagnostic declaration', () => {
    const present = new Set(files.map(([relativeName]) => relativeName));
    expect(Object.keys(EXTERNAL_TEMPLATE_DIAGNOSTICS).filter((name) => !present.has(name))).toStrictEqual([]);
  });
});
