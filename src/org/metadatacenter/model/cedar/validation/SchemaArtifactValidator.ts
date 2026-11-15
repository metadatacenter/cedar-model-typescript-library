import * as schemas from './generated/artifact-schemas';
import { ExactDecimal } from '../../../policy/NumericPolicy';
import { ValidationFinding, ValidationPolicy, ValidationSummary } from '../../../policy/ValidationPolicy';
import { SchemaValuePolicy } from '../../../policy/SchemaValuePolicy';
import { IdentifierPolicy } from '../../../policy/IdentifierPolicy';
import { TextPolicy } from '../../../policy/TextPolicy';
import { AttributeValueFieldParent, ReservedNames } from '../ReservedNames';

export type SchemaArtifactKind = 'template' | 'element' | 'field';
type ObjectNode = Record<string, unknown>;
const object = (value: unknown): value is ObjectNode => value !== null && typeof value === 'object' && !Array.isArray(value);
/** A child's definition: the declaration itself, or the items of a repeated child's list. */
const definition = (declared: unknown): ObjectNode | null =>
  !object(declared) ? null : object(declared.items) ? declared.items : declared;
const text = (value: unknown): string => (typeof value === 'string' ? value : '');
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
      this.serverRules(node, inferred, findings);
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
  /**
   * What the server's validator asks of a schema artifact beyond its meta-schema, as Java's
   * `CedarValidator` asks it. A child's key becomes a property of every instance, so it may not be
   * blank or a name `ReservedNames` keeps for instance metadata, and an attribute-value field's key
   * also stays off the YAML metadata keys of its parent. A version must be one `ResourceVersion` can
   * hold. Wherever the artifact names another resource, the IRI must be absolute, which `format: uri`
   * does not require: its own `@id`, a previous version, `pav:derivedFrom` at any depth, each child's
   * property IRI, the terms its constraints name and an IRI default.
   */
  private static serverRules(node: ObjectNode, kind: SchemaArtifactKind, findings: ValidationFinding[]): void {
    if (kind !== 'field') {
      this.propertyIris(node, '', findings);
      this.childKeys(node, kind, '', findings);
    }
    this.derivedFrom(node, '', findings);
    this.iriDefaults(node, '', findings);
    this.identifiers(node, '', true, findings);
    this.versions(node, '', findings);
  }

  /** A template's or element's children: each property whose definition has a `_ui`, with that definition. */
  private static children(container: ObjectNode): [string, unknown, ObjectNode][] {
    if (!object(container.properties)) return [];
    return Object.entries(container.properties).flatMap(([key, declared]): [string, unknown, ObjectNode][] => {
      const child = definition(declared);
      return child !== null && object(child._ui) ? [[key, declared, child]] : [];
    });
  }

  private static refuse(findings: ValidationFinding[], path: string, message: string): void {
    findings.push(ValidationPolicy.finding('valueShape', path, message));
  }

  private static childKeys(container: ObjectNode, parent: AttributeValueFieldParent, path: string, findings: ValidationFinding[]): void {
    for (const [key, , child] of this.children(container)) {
      const location = ValidationPolicy.child(path + '/properties', key);
      if (TextPolicy.isBlank(key)) this.refuse(findings, location, 'A child key must not be blank.');
      else if (ReservedNames.isReservedName(key)) this.refuse(findings, location, `Child key "${key}" is reserved for instance metadata.`);
      else if (
        text((child._ui as ObjectNode).inputType) === 'attribute-value' &&
        ReservedNames.isReservedAttributeValueFieldName(key, parent)
      )
        this.refuse(findings, location, `Attribute-value field key "${key}" is reserved for the YAML metadata of its parent.`);
      if (child['@type'] === core + 'TemplateElement') this.childKeys(child, 'element', location, findings);
    }
  }

  private static propertyIris(container: ObjectNode, path: string, findings: ValidationFinding[]): void {
    const context = object(container.properties) ? container.properties['@context'] : undefined;
    const mappings = object(context) && object(context.properties) ? context.properties : {};
    for (const [key, , child] of this.children(container)) {
      const mapping = mappings[key];
      for (const iri of object(mapping) && Array.isArray(mapping.enum) ? mapping.enum : [])
        if (typeof iri === 'string' && !IdentifierPolicy.isValid(iri))
          this.refuse(
            findings,
            ValidationPolicy.child(path + '/properties/@context/properties', key) + '/enum',
            `The property IRI of child "${key}" must be an absolute IRI.`,
          );
      this.propertyIris(child, ValidationPolicy.child(path + '/properties', key), findings);
    }
  }

  private static derivedFrom(node: unknown, path: string, findings: ValidationFinding[]): void {
    if (Array.isArray(node)) node.forEach((item, index) => this.derivedFrom(item, ValidationPolicy.child(path, index), findings));
    if (!object(node)) return;
    const value = node['pav:derivedFrom'];
    if (typeof value === 'string' && !IdentifierPolicy.isValid(value))
      this.refuse(findings, path + '/pav:derivedFrom', 'pav:derivedFrom must be an absolute IRI when present.');
    for (const [key, item] of Object.entries(node)) this.derivedFrom(item, ValidationPolicy.child(path, key), findings);
  }

  /** A stated default of a field whose value is an IRI. The readers take an empty one as no default. */
  private static iriDefaults(declared: unknown, path: string, findings: ValidationFinding[]): void {
    const node = definition(declared);
    if (node === null) return;
    const value = object(node._valueConstraints) ? node._valueConstraints.defaultValue : undefined;
    if (iriInputs.has(text(object(node._ui) ? node._ui.inputType : undefined)) && typeof value === 'string' && value !== '')
      if (!IdentifierPolicy.isValid(value))
        this.refuse(findings, path + '/_valueConstraints/defaultValue', 'This default value must be an IRI.');
    for (const [key, child] of this.children(node)) this.iriDefaults(child, ValidationPolicy.child(path + '/properties', key), findings);
  }

  /**
   * The identifiers an artifact states outside its children's values. A nested child's `@id` is left
   * alone: the Template Designer writes a temporary, relative one for a child it has just added, and
   * the server replaces it. So is an action's `sourceUri`, where the legacy editor writes `template`.
   */
  private static identifiers(declared: unknown, path: string, root: boolean, findings: ValidationFinding[]): void {
    const node = definition(declared);
    if (node === null) return;
    const require = (value: unknown, location: string, what: string): void => {
      if (typeof value === 'string' && !IdentifierPolicy.isValid(value))
        this.refuse(findings, location, `${what} must be an absolute IRI.`);
    };
    if (root) require(node['@id'], path + '/@id', '@id');
    require(node['pav:previousVersion'], path + '/pav:previousVersion', 'pav:previousVersion');
    const constraints = object(node._valueConstraints) ? node._valueConstraints : {};
    for (const group of ['ontologies', 'classes', 'branches', 'valueSets']) {
      const entries = constraints[group];
      if (Array.isArray(entries))
        entries.forEach((entry, index) =>
          require(object(entry) ? entry.uri : undefined, `${path}/_valueConstraints/${group}/${index}/uri`, `A ${group} constraint's uri`),
        );
    }
    const actions = constraints.actions;
    if (Array.isArray(actions))
      actions.forEach((entry, index) =>
        require(object(entry) ? entry.termUri : undefined, `${path}/_valueConstraints/actions/${index}/termUri`, "An action's termUri"),
      );
    if (object(constraints.defaultValue))
      require(constraints.defaultValue.termUri, path + '/_valueConstraints/defaultValue/termUri', "A default value's termUri");
    for (const [key, child] of this.children(node))
      this.identifiers(child, ValidationPolicy.child(path + '/properties', key), false, findings);
  }

  /**
   * A version of three numbers, each of which fits an int, other than `0.0.0`, as the readers and the
   * server's `ResourceVersion` hold it. The meta-schemas' pattern refuses every other shape.
   */
  private static versions(node: unknown, path: string, findings: ValidationFinding[]): void {
    if (Array.isArray(node)) node.forEach((item, index) => this.versions(item, ValidationPolicy.child(path, index), findings));
    if (!object(node)) return;
    const version = node['pav:version'];
    if (typeof version === 'string' && /^\d+\.\d+\.\d+$/.test(version)) {
      const fits = version.split('.').every((part) => part.length < 10 || (part.length === 10 && part <= '2147483647'));
      if (!fits) this.refuse(findings, path + '/pav:version', 'Each part of pav:version must fit an int.');
      else if (version === '0.0.0') this.refuse(findings, path + '/pav:version', 'pav:version must not be 0.0.0.');
    }
    for (const [key, item] of Object.entries(node)) this.versions(item, ValidationPolicy.child(path, key), findings);
  }
}
