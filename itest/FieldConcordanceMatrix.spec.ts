import { createHash } from 'node:crypto';
import * as YAML from 'yaml';
import { CedarReaders, CedarWriters, CedarFieldType } from '../src';
import {
  fieldCase,
  fieldCases as cases,
  fieldInputs as inputs,
  fieldMatrixBytes as bytes,
  fieldMatrixLock as lock,
} from './FieldConcordanceFixture';

const jsonReaders = CedarReaders.json().getStrict();
const yamlReaders = CedarReaders.yaml().getStrict();
const jsonWriters = CedarWriters.json().getStrict();
const yamlWriters = CedarWriters.yaml().getStrict();

it('pins Java fixture provenance and covers every TypeScript field type', () => {
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(lock.javaCommit).toMatch(/^[a-f0-9]{40}$/);
  expect(cases).toHaveLength(lock.caseCount);
  expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length);
  const baseline = cases.filter((c) => c.feature === 'baseline');
  const covered = baseline.map((c) => jsonReaders.getTemplateFieldReader().readFromObject(c.json).field.cedarFieldType);
  expect(new Set(covered)).toEqual(new Set(CedarFieldType.values()));
});

for (const row of cases) {
  describe(row.id, () => {
    it('Java JSON → TS model → JSON preserves the entire field definition', () => {
      const field = jsonReaders.getTemplateFieldReader().readFromObject(row.json).field;
      expect(jsonWriters.getFieldWriterForField(field).getAsJsonNode(field)).toEqual(row.json);
    });
    it('Java template JSON → TS model → JSON preserves the field and deployment', () => {
      const template = jsonReaders.getTemplateReader().readFromObject(row.templateJson).template;
      expect(jsonWriters.getTemplateWriter().getAsJsonNode(template)).toEqual(row.templateJson);
    });
    it('Java element JSON → TS model → JSON preserves the field and deployment', () => {
      const element = jsonReaders.getTemplateElementReader().readFromObject(row.elementJson).element;
      expect(jsonWriters.getTemplateElementWriter().getAsJsonNode(element)).toEqual(row.elementJson);
    });
    for (const compact of [false, true]) {
      const yamlReaders = compact ? CedarReaders.yaml().getStrictForCompact() : CedarReaders.yaml().getStrict();
      const fieldYaml = compact ? row.compactYaml : row.yaml;
      const templateYaml = compact ? row.templateCompactYaml : row.templateYaml;
      const elementYaml = compact ? row.elementCompactYaml : row.elementYaml;
      it(`${compact ? 'compact' : 'full'} field YAML agrees and reader JSON follows the Java lifecycle policy`, () => {
        const original = jsonReaders.getTemplateFieldReader().readFromObject(row.json).field;
        const written = yamlWriters.getFieldWriterForField(original).getAsYamlString(original, compact);
        expect(YAML.parse(written)).toEqual(YAML.parse(fieldYaml));
        const read = yamlReaders.getTemplateFieldReader().readFromString(fieldYaml).field;
        const actual = jsonWriters.getFieldWriterForField(read).getAsJsonNode(read);
        expect(actual).toEqual(compact ? row.jsonFromCompactYaml : row.jsonFromYaml);
      });
      it(`${compact ? 'compact' : 'full'} template YAML agrees and reader JSON preserves deployment under the Java lifecycle policy`, () => {
        const original = jsonReaders.getTemplateReader().readFromObject(row.templateJson).template;
        const written = yamlWriters.getTemplateWriter().getAsYamlString(original, compact);
        expect(YAML.parse(written)).toEqual(YAML.parse(templateYaml));
        const read = yamlReaders.getTemplateReader().readFromString(templateYaml).template;
        const actual = jsonWriters.getTemplateWriter().getAsJsonNode(read);
        expect(actual).toEqual(compact ? row.templateJsonFromCompactYaml : row.templateJsonFromYaml);
      });
      it(`${compact ? 'compact' : 'full'} element YAML agrees and reader JSON preserves deployment under the Java lifecycle policy`, () => {
        const original = jsonReaders.getTemplateElementReader().readFromObject(row.elementJson).element;
        const written = yamlWriters.getTemplateElementWriter().getAsYamlString(original, compact);
        expect(YAML.parse(written)).toEqual(YAML.parse(elementYaml));
        const read = yamlReaders.getTemplateElementReader().readFromString(elementYaml).element;
        const actual = jsonWriters.getTemplateElementWriter().getAsJsonNode(read);
        expect(actual).toEqual(compact ? row.elementJsonFromCompactYaml : row.elementJsonFromYaml);
      });
    }
  });
}

/*
 * A version stated in a form no writer produces. Java reads the string "latest" as it reads an absent
 * version, so both readers here must produce the documents of the case with none, and both writers
 * must then write what Java writes for it. Java refuses a version object that names no snapshot, and
 * so must both readers here.
 */
for (const input of inputs) {
  describe(input.id, () => {
    if (input.refused) {
      it('the JSON reader refuses it, as Java refuses it', () => {
        expect(() => jsonReaders.getTemplateFieldReader().readFromObject(input.json)).toThrow(/version/);
      });
      it('the YAML reader refuses it, as Java refuses it', () => {
        expect(() => yamlReaders.getTemplateFieldReader().readFromString(input.yaml)).toThrow(/version/);
      });
      return;
    }
    const expected = fieldCase(input.against);
    it('JSON reads as Java reads it, and both writers write what Java writes', () => {
      const field = jsonReaders.getTemplateFieldReader().readFromObject(input.json).field;
      expect(jsonWriters.getFieldWriterForField(field).getAsJsonNode(field)).toEqual(expected.json);
      expect(YAML.parse(yamlWriters.getFieldWriterForField(field).getAsYamlString(field))).toEqual(YAML.parse(expected.yaml));
    });
    it('YAML reads as Java reads it, and both writers write what Java writes', () => {
      const field = yamlReaders.getTemplateFieldReader().readFromString(input.yaml).field;
      expect(jsonWriters.getFieldWriterForField(field).getAsJsonNode(field)).toEqual(expected.jsonFromYaml);
      expect(YAML.parse(yamlWriters.getFieldWriterForField(field).getAsYamlString(field))).toEqual(YAML.parse(expected.yaml));
    });
  });
}
