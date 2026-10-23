import { CedarArtifactId, CedarReaders, CedarWriters, JsonArtifactParsingResult } from '../../src';
import { TestUtil } from '../TestUtil';
import { ceeSuiteTestMap } from './generatedTestCases';
import { TestResource } from '../TestResource';
import { CEE_INSTANCE_DIAGNOSTICS, CEE_TEMPLATE_DIAGNOSTICS, diagnosticsFor } from './compatibilityExpectations';

interface Diagnostics {
  errors: number;
  warnings: number;
}

const diagnostics = (result: JsonArtifactParsingResult): Diagnostics => ({
  errors: result.getBlueprintComparisonErrorCount(),
  warnings: result.getBlueprintComparisonWarningCount(),
});

const cases = TestUtil.testMap(ceeSuiteTestMap, [], []);
const templateCases = cases.filter(([, definition]) => definition.template);
const instanceCases = cases.filter(([, definition]) => definition.instance);

describe('CEE compatibility corpus', () => {
  it('contains the complete committed fixture inventory', () => {
    expect(templateCases).toHaveLength(85);
    expect(instanceCases).toHaveLength(57);
  });

  it.each(templateCases)('template %i has only its declared compatibility diagnostics', (testNumber) => {
    const resource = TestResource.ceeSuite(testNumber);
    if (testNumber === 86) {
      // This fixture deliberately contains malformed JSON; previous readers replaced it with {}.
      expect(() => CedarReaders.json().getFebruary2024().getTemplateReader().readFromString(TestUtil.readReferenceJson(resource))).toThrow(
        SyntaxError,
      );
      return;
    }
    const result = CedarReaders.json().getFebruary2024().getTemplateReader().readFromString(TestUtil.readReferenceJson(resource));

    expect(diagnostics(result.parsingResult)).toStrictEqual(
      diagnosticsFor(CEE_TEMPLATE_DIAGNOSTICS, testNumber.toString().padStart(3, '0')),
    );

    const emitted = CedarWriters.json().getFebruary2024().getTemplateWriter().getAsJsonNode(result.template);
    expect(Object.keys(emitted).length).toBeGreaterThan(0);
  });

  it.each(instanceCases)('instance %i has only its declared compatibility diagnostics', (testNumber) => {
    const resource = TestResource.ceeSuite(testNumber);
    const result = CedarReaders.json()
      .getFebruary2024()
      .getTemplateInstanceReader()
      .readFromString(TestUtil.readReferenceInstanceJson(resource));

    expect(diagnostics(result.parsingResult)).toStrictEqual(
      diagnosticsFor(CEE_INSTANCE_DIAGNOSTICS, testNumber.toString().padStart(3, '0')),
    );

    const writer = CedarWriters.json().getFebruary2024().getTemplateInstanceWriter();
    if (result.instance.schema_isBasedOn === CedarArtifactId.NULL) {
      // 28 of these 57 were extracted without their envelope, so they name no template, and the writer
      // refuses an instance that names none.
      expect(() => writer.getAsJsonNode(result.instance)).toThrow('A template instance must name the template it is based on.');
      return;
    }
    const emitted = writer.getAsJsonNode(result.instance);
    expect(Object.keys(emitted).length).toBeGreaterThan(0);
  });

  it('has no stale diagnostic declaration', () => {
    const knownTemplates = new Set(templateCases.map(([number]) => number.toString().padStart(3, '0')));
    const knownInstances = new Set(instanceCases.map(([number]) => number.toString().padStart(3, '0')));
    expect(Object.keys(CEE_TEMPLATE_DIAGNOSTICS).filter((id) => !knownTemplates.has(id))).toStrictEqual([]);
    expect(Object.keys(CEE_INSTANCE_DIAGNOSTICS).filter((id) => !knownInstances.has(id))).toStrictEqual([]);
  });
});
