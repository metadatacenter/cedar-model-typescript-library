import * as schemas from './generated/artifact-schemas';
import { ExactDecimal } from '../../../policy/NumericPolicy';
import { ValidationFinding, ValidationPolicy, ValidationSummary } from '../../../policy/ValidationPolicy';
import { SchemaValuePolicy } from '../../../policy/SchemaValuePolicy';

export type SchemaArtifactKind = 'template' | 'element' | 'field';
type ObjectNode = Record<string, unknown>;
const object = (value: unknown): value is ObjectNode => value !== null && typeof value === 'object' && !Array.isArray(value);
const core = 'https://schema.metadatacenter.org/core/';
const iriInputs = new Set([
  'controlled-term',
  'link',
  'ext-orcid',
  'ext-ror',
  'ext-pfas',
  'ext-rrid',
  'ext-pubmed',
  'ext-nih-grant-id',
  'ext-doi',
]);

/**
 * Checks the JSON that will be sent, before a model reader can normalize or omit unsupported content.
 * Structural rules are compiled from Java's meta-schemas. This does not replace the server's reader
 * or terminology checks; the conformance gate exercises both readers against the same payload.
 */
export class SchemaArtifactValidator {
  static readonly schemaDigests = schemas.schemaDigests;

  static validate(source: unknown, kind?: SchemaArtifactKind): ValidationSummary {
    const findings = this.structure(source, kind).findings;
    if (!findings.length) SchemaValuePolicy.visit(source, '', findings);
    return ValidationPolicy.summarize(findings, 'template');
  }

  static structure(source: unknown, kind?: SchemaArtifactKind): ValidationSummary {
    const findings: ValidationFinding[] = [];
    try {
      const node = source as ObjectNode;
      if (!object(node)) throw new Error('Expected a template, element or field object.');
      const wrapped = node.type === 'array' && object(node.items) && node.items['@type'] === core + 'TemplateField';
      if (
        wrapped &&
        !['checkbox', 'attribute-value'].includes(
          String((node.items as ObjectNode)._ui && ((node.items as ObjectNode)._ui as ObjectNode).inputType),
        )
      )
        throw new Error('This standalone field must use an object schema.');
      const inferred = wrapped
        ? 'field'
        : node['@type'] === core + 'Template'
          ? 'template'
          : node['@type'] === core + 'TemplateElement'
            ? 'element'
            : [core + 'TemplateField', core + 'StaticTemplateField'].includes(String(node['@type']))
              ? 'field'
              : undefined;
      if (!inferred || (kind && kind !== inferred)) throw new Error('The artifact type does not match the requested schema artifact.');
      const view = this.schemaView(source);
      const check = wrapped
        ? schemas.multiple
        : inferred === 'template'
          ? schemas.template
          : inferred === 'element'
            ? schemas.element
            : node['@type'] === core + 'StaticTemplateField'
              ? schemas.staticField
              : iriInputs.has(String((node._ui as ObjectNode | undefined)?.inputType))
                ? schemas.iri
                : schemas.literal;
      if (!check(view)) {
        const seen = new Set<string>();
        for (const error of this.explain(view, [...(check.errors ?? [])])) {
          const property = error.params.additionalProperty ?? error.params.missingProperty;
          const path = property ? ValidationPolicy.child(error.instancePath, property) : error.instancePath;
          const key = path + ':' + error.keyword;
          if (seen.has(key)) continue;
          seen.add(key);
          findings.push(ValidationPolicy.finding('schema.' + error.keyword, path, error.message ?? 'Invalid schema artifact.'));
        }
      }
      this.occurrences(source, '', findings);
    } catch (error) {
      findings.push(ValidationPolicy.finding('schema.invalid', '', error instanceof Error ? error.message : 'Invalid schema artifact.'));
    }
    return ValidationPolicy.summarize(findings, 'template');
  }

  // A failed oneOf emits failures for every alternative, including irrelevant field types.
  // Keep the full canonical verdict, but replace a failing typed child's alternatives with that
  // child's own diagnostics. A valid child never hides a parent/wrapper defect.
  private static explain(view: unknown, errors: schemas.SchemaError[]): schemas.SchemaError[] {
    if (!object(view)) return errors;
    const children: [string, unknown][] =
      view.type === 'array'
        ? [['/items', view.items]]
        : [core + 'Template', core + 'TemplateElement'].includes(String(view['@type'])) && object(view.properties)
          ? Object.entries(view.properties).map(([key, child]) => [ValidationPolicy.child('/properties', key), child])
          : [];
    for (const [path, child] of children) {
      if (!object(child)) continue;
      const type = child['@type'],
        input = object(child._ui) ? child._ui.inputType : undefined;
      const check =
        child.type === 'array'
          ? schemas.multipleChild
          : type === core + 'TemplateElement'
            ? schemas.element
            : type === core + 'StaticTemplateField'
              ? schemas.staticField
              : type !== core + 'TemplateField'
                ? undefined
                : input === 'attribute-value'
                  ? schemas.attributeField
                  : iriInputs.has(String(input))
                    ? schemas.iri
                    : schemas.literal;
      if (!check || check(child)) continue;
      const specific = this.explain(child, [...(check.errors ?? [])]);
      if (!specific.length) continue;
      errors = errors.filter((error) => error.instancePath !== path && !error.instancePath.startsWith(path + '/'));
      errors.push(...specific.map((error) => ({ ...error, instancePath: path + error.instancePath })));
    }
    return errors;
  }

  // The schema describes numeric *shapes*. Keep the original exact atoms for value-policy checks;
  // only this disposable view uses JS numbers. Reader-size limits are checked against the originals.
  private static schemaView(value: unknown, ancestors = new Set<object>()): unknown {
    if (ExactDecimal.isExact(value)) return Number(String(value));
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Nonfinite JSON number.');
    if (value === null || typeof value !== 'object') return value;
    if (ancestors.has(value)) throw new Error('A schema artifact cannot contain a cycle.');
    ancestors.add(value);
    const result = Array.isArray(value)
      ? value.map((item) => this.schemaView(item, ancestors))
      : Object.fromEntries(Object.entries(value).map(([key, item]) => [key, this.schemaView(item, ancestors)]));
    ancestors.delete(value);
    return result;
  }

  private static occurrences(value: unknown, path: string, findings: ValidationFinding[]): void {
    if (!object(value)) return;
    if (value.type === 'array') {
      for (const key of ['minItems', 'maxItems']) {
        const bound = value[key];
        if (bound !== undefined && (typeof bound !== 'number' || !Number.isInteger(bound) || bound < 0 || bound > 2147483647))
          findings.push(
            ValidationPolicy.finding(
              'schema.occurrences',
              path + '/' + key,
              'Occurrence limits must be integers between 0 and 2147483647.',
            ),
          );
      }
      this.occurrences(value.items, path + '/items', findings);
    } else if ([core + 'Template', core + 'TemplateElement'].includes(String(value['@type'])) && object(value.properties)) {
      for (const [key, child] of Object.entries(value.properties))
        this.occurrences(child, ValidationPolicy.child(path + '/properties', key), findings);
    }
  }
}
