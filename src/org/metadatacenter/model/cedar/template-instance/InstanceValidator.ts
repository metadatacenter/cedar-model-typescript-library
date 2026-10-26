import { TemplateInstance } from './TemplateInstance';
import { InstanceDataContainer } from './InstanceDataContainer';
import { InstanceDataAtomType } from './InstanceDataAtomType';
import { InstanceDataEmptyAtom } from './InstanceDataEmptyAtom';
import { InstanceDataEmptyNode } from './InstanceDataEmptyNode';
import { InstanceDataStringAtom } from './InstanceDataStringAtom';
import { InstanceDataTypedAtom } from './InstanceDataTypedAtom';
import { AbstractContainerArtifact } from '../AbstractContainerArtifact';
import { AbstractChildDeploymentInfo } from '../deployment/AbstractChildDeploymentInfo';
import { AbstractDynamicChildDeploymentInfo } from '../deployment/AbstractDynamicChildDeploymentInfo';
import { TemplateElement } from '../element/TemplateElement';
import { Template } from '../template/Template';
import { JsonArtifactParsingResult } from '../util/compare/JsonArtifactParsingResult';
import { ComparisonError } from '../util/compare/ComparisonError';
import { ComparisonErrorType } from '../util/compare/ComparisonErrorType';
import { JsonPath } from '../util/path/JsonPath';
import { UiInputType } from '../types/wrapped-types/UiInputType';
import { InstanceDataAttributeValueField } from './InstanceDataAttributeValueField';
import { InstanceDataAttributeValueFieldName } from './InstanceDataAttributeValueFieldName';
import { AttributeValueNamePolicy } from './AttributeValueNamePolicy';
import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { TemplateField } from '../field/TemplateField';
import { JsonTemplateInstanceWriter } from '../../../io/writer/json/JsonTemplateInstanceWriter';
import { FieldValuePolicy } from '../../../policy/FieldValuePolicy';
import { ValidationPolicy, ValidationSummary } from '../../../policy/ValidationPolicy';
import { validationFieldSchema } from '../util/validationFieldSchema';
import { JsonNode } from '../types/basic-types/JsonNode';
import { StoredForm } from './StoredForm';
import { ReservedNames } from '../ReservedNames';
import { ContainerArtifactChildrenInfo } from '../deployment/ContainerArtifactChildrenInfo';
import { JsonTemplateInstanceContent } from '../util/serialization/JsonTemplateInstanceContent';
import { IdentifierPolicy } from '../../../policy/IdentifierPolicy';
import { TimestampPolicy } from '../../../policy/TimestampPolicy';
import { JsonAnnotationsWriter } from '../../../io/writer/json/JsonAnnotationsWriter';
import { CedarModel } from '../constants/CedarModel';
import { JsonSchema } from '../constants/JsonSchema';
import { ValidationField } from '../../../policy/FieldValuePolicy';

const LOCATION = 'InstanceValidator';

/** How the caller will write the instance it asks about. */
export interface InstanceValidationOptions {
  /**
   * The caller writes the instance through `InstanceInflater` and this
   * library's JSON writer, and asks whether the server would store what that
   * write produces. The write maps each child to the template's property IRI,
   * gives the root the standard `@context` terms, and leaves out an optional
   * property held as null, so those are judged as written rather than as the
   * instance holds them. A term the template does not declare is still judged,
   * since the write keeps it. Without this the instance is judged as it was
   * stored.
   */
  asWritten?: boolean;

  /**
   * The caller asks whether the server would store the document exactly as it
   * stands, as a verbatim write stores it. An editor's save leaves the
   * document's identity, its provenance and each element occurrence's `@id` to
   * the host and the server, which write them before judging it, so without
   * this they are not asked of the instance. A verbatim write is judged with
   * them, so each container's own keys are then held to what its stored schema
   * requires and admits. It has no effect with `asWritten`, whose write gets
   * those keys from the host and the server too.
   */
  verbatim?: boolean;
}

/**
 * Compare a parsed instance with its template without repairing it. Missing slots,
 * wrong atom/container shapes and malformed typed values are structural errors.
 * Well-formed answers outside field constraints and incomplete answers are quality
 * findings. validateReport exposes saveability separately from full validity.
 * Remote terminology and authority verification is explicitly not checked here.
 */
export class InstanceValidator {
  private constructor() {}

  /**
   * The instance judged against its template.
   *
   * A `JsonArtifactParsingResult` rather than a new result type, so a consumer
   * already reading `wasSuccessful()` or `adheresToBlueprint()` off a reader
   * result can read this the same way.
   *
   * `stored` is the template document as it is stored, when the caller has it.
   * The server judges an instance against that document, and three of its facts
   * can differ from what the model would write: which children a container
   * requires, which further keys a container admits, and which properties a
   * field's value must carry. Older templates state them differently, and
   * neither library's model keeps them, so where `stored` is given they come
   * from it. Its `@context` schemas are also where the server checks each
   * container's property IRIs, which are judged only where it is given. Without
   * it the instance is judged against the template as the model writes it.
   */
  public static validate(
    instance: TemplateInstance,
    template: Template,
    stored: JsonNode | null = null,
    options: InstanceValidationOptions = {},
  ): JsonArtifactParsingResult {
    const result = new JsonArtifactParsingResult();
    InstanceValidator.validateContainer(
      instance.dataContainer,
      template,
      new JsonPath(),
      result,
      InstanceValidator.object(stored),
      options,
    );
    const members = options.asWritten === true ? null : StoredForm.membersOf(instance.dataContainer);
    const annotations =
      members !== null ? members[CedarModel.annotations] : (JsonAnnotationsWriter.annotationsNode(instance.annotations) ?? undefined);
    InstanceValidator.validateOwnTerm(CedarModel.annotations, annotations, InstanceValidator.object(stored), new JsonPath(), result);
    return result;
  }

  /** Saveability and quality are different answers; semantic checks remain explicitly not checked. */
  public static validateReport(
    instance: TemplateInstance,
    template: Template,
    stored: JsonNode | null = null,
    options: InstanceValidationOptions = {},
  ): ValidationSummary {
    return this.validate(instance, template, stored, options).getValidationReport();
  }

  private static validateContainer(
    container: InstanceDataContainer,
    template: AbstractContainerArtifact,
    path: JsonPath,
    result: JsonArtifactParsingResult,
    stored: JsonNode | null,
    options: InstanceValidationOptions,
  ): void {
    const info = template.getChildrenInfo();
    const attributeNames = new Set(
      InstanceValidator.attributeValueGroups(container)
        .filter(([group]) => info.get(group)?.uiInputType === UiInputType.ATTRIBUTE_VALUE)
        .flatMap(([, names]) => names),
    );
    for (const name of Object.keys(container.values)) {
      if (info.get(name) === null && !attributeNames.has(name) && !InstanceValidator.admitsUndeclared(stored, container.values[name])) {
        result.addValidationFinding(
          ValidationPolicy.finding('valueShape', path.add(name).toPointer(), 'The template does not declare this property.'),
        );
      }
    }

    const parent = template.cedarArtifactType === CedarArtifactType.TEMPLATE ? 'template' : 'element';
    for (const conflict of AttributeValueNamePolicy.findConflicts(container, parent).filter((candidate) => candidate.path.length === 0)) {
      result.addBlueprintComparisonError(
        new ComparisonError(
          LOCATION,
          ComparisonErrorType.VALUE_MISMATCH,
          path.add(...AttributeValueNamePolicy.locationOf(conflict)),
          'a unique, non-reserved attribute-value name',
          conflict.name,
        ),
      );
    }

    for (const [groupName, attributeNames] of InstanceValidator.attributeValueGroups(container)) {
      for (const attributeName of attributeNames) {
        const conflictingChild = info.get(attributeName);
        if (conflictingChild !== null && conflictingChild.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD) {
          result.addBlueprintComparisonError(
            new ComparisonError(
              LOCATION,
              ComparisonErrorType.VALUE_MISMATCH,
              path.add(groupName, attributeName),
              'a name different from every serializable template child',
              attributeName,
            ),
          );
        }
      }
    }

    const context = InstanceValidator.object(InstanceValidator.object(stored?.properties)?.[JsonSchema.atContext]);
    if (context !== null) {
      // The writer supplies the standard terms at the root and none below it.
      const written = path.toPointer() === '' ? JsonTemplateInstanceContent.CONTEXT_VERBATIM : JsonNode.getEmpty();
      const terms = options.asWritten === true ? written : StoredForm.contextTermsOf(container);
      const supplied = options.asWritten === true ? info.getChildIriMap() : {};
      InstanceValidator.validateContext(container, context, terms, supplied, path, result);
    }

    if (options.verbatim === true && options.asWritten !== true) {
      InstanceValidator.validateMembers(container, stored, path, result);
    }
    InstanceValidator.validateOwnTerm(JsonSchema.atType, InstanceValidator.statedTypes(container, options), stored, path, result);

    for (const name of InstanceValidator.requiredChildren(info, stored)) {
      if (!Object.hasOwn(container.values, name)) {
        result.addBlueprintComparisonError(
          new ComparisonError(LOCATION, ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, path.add(name), name),
        );
      }
    }

    for (const name of info.getChildrenNames()) {
      const childInfo = info.get(name);

      /**
       * An attribute-value field is not checked. Its instance representation is
       * a set of keys the user invented, not a value node, so the template
       * declares nothing here to compare against — which is the same reason
       * `getChildrenNamesForRequiredInProperties` leaves it out of `required`.
       */
      if (childInfo?.uiInputType === UiInputType.ATTRIBUTE_VALUE) {
        InstanceValidator.validateAttributeNames(container.values[name], path.add(name), result);
        continue;
      }

      const value = container.values[name];
      if (value === undefined) {
        // Already reported above when the template requires it; a child that is
        // not required may legitimately be absent.
        continue;
      }
      InstanceValidator.validateChild(
        name,
        value,
        childInfo,
        template.getChild(name),
        path.add(name),
        result,
        InstanceValidator.object(InstanceValidator.object(stored?.properties)?.[name]),
        options,
      );
    }
  }

  /**
   * A container's `@context` judged against its stored `@context` schema.
   *
   * The model holds the IRI an instance maps each child to, and `terms` holds
   * the standard prefixes and term definitions: the stored ones, or the ones
   * the writer gives the document. A declared key must take a value the
   * template admits, an undeclared one must be admitted by
   * `additionalProperties`, and every required key must be there. `supplied`
   * holds the child mappings the caller's writer takes from the template
   * instead, and `terms` is null where the stored terms are not known.
   */
  private static validateContext(
    container: InstanceDataContainer,
    context: JsonNode,
    terms: { [key: string]: unknown } | null,
    supplied: Record<string, string>,
    path: JsonPath,
    result: JsonArtifactParsingResult,
  ): void {
    const declared = InstanceValidator.object(context.properties) ?? JsonNode.getEmpty();
    const at = path.add(JsonSchema.atContext);
    const entries: Array<[string, unknown]> = [
      ...Object.entries(terms ?? {}),
      ...Object.entries(container.iris).filter(([key]) => !Object.hasOwn(supplied, key)),
    ];
    for (const [key, value] of entries) {
      const term = InstanceValidator.object(declared[key]);
      if (term !== null) {
        if (!InstanceValidator.conformsTo(term, value)) {
          result.addValidationFinding(
            ValidationPolicy.finding('valueShape', at.add(key).toPointer(), "The template's @context gives this property another value."),
          );
        }
        continue;
      }
      const additional = context.additionalProperties;
      const schema = InstanceValidator.object(additional);
      if (additional === false || (schema !== null && !InstanceValidator.conformsTo(schema, value))) {
        result.addValidationFinding(
          ValidationPolicy.finding('valueShape', at.add(key).toPointer(), "The template's @context does not declare this property."),
        );
      }
    }
    const required = Array.isArray(context.required) ? context.required : [];
    for (const key of required) {
      if (typeof key !== 'string' || Object.hasOwn(supplied, key) || container.hasIri(key)) continue;
      if (Object.hasOwn(JsonTemplateInstanceContent.CONTEXT_VERBATIM, key) && (terms === null || Object.hasOwn(terms, key))) continue;
      result.addValidationFinding(
        ValidationPolicy.finding('missingProperty', at.add(key).toPointer(), "The template's @context requires this property."),
      );
    }
  }

  /** Judged elsewhere: the `@context` by `validateContext`, the others by `validateOwnTerm` in every mode. */
  private static readonly OWN_TERMS: ReadonlySet<string> = new Set([JsonSchema.atContext, JsonSchema.atType, CedarModel.annotations]);

  /**
   * A container's `@type`, as stored or, with `asWritten` or for a model the reader did not build, as
   * the writer writes it. Undefined where there is none.
   */
  private static statedTypes(container: InstanceDataContainer, options: InstanceValidationOptions): unknown {
    const members = options.asWritten === true ? null : StoredForm.membersOf(container);
    if (members !== null) return members[JsonSchema.atType];
    return JsonTemplateInstanceWriter.writeTypes(container)[JsonSchema.atType];
  }

  /**
   * A key the instance holds of its own, its `@type` or its `_annotations`, against the stored
   * template. Neither is the host's or the server's to write, so every save writes it as the instance
   * holds it. A key the template declares must take a value its schema admits, and one it does not
   * declare must be admitted by `additionalProperties`.
   */
  private static validateOwnTerm(
    name: string,
    value: unknown,
    stored: JsonNode | null,
    path: JsonPath,
    result: JsonArtifactParsingResult,
  ): void {
    if (value === undefined || stored === null) return;
    const schema = InstanceValidator.object(InstanceValidator.object(stored.properties)?.[name]);
    if (schema !== null) {
      if (!InstanceValidator.conformsTo(schema, value)) {
        result.addValidationFinding(
          ValidationPolicy.finding('valueShape', path.add(name).toPointer(), 'The template does not admit this value here.'),
        );
      }
      return;
    }
    const additional = stored.additionalProperties;
    const extra = InstanceValidator.object(additional);
    if (additional === false || (extra !== null && !InstanceValidator.conformsTo(extra, value))) {
      result.addValidationFinding(
        ValidationPolicy.finding('valueShape', path.add(name).toPointer(), 'The template does not declare this property.'),
      );
    }
  }

  /**
   * A container's own keys as a verbatim write stores them, against its stored
   * schema: its `@context` and `@id` and, at the root, the template, name and
   * provenance. Each key the schema requires must be there, and each one there
   * must take a value the schema admits. The `@context` entries themselves are
   * judged by `validateContext`, and annotations by the reader.
   */
  private static validateMembers(
    container: InstanceDataContainer,
    stored: JsonNode | null,
    path: JsonPath,
    result: JsonArtifactParsingResult,
  ): void {
    const members = StoredForm.membersOf(container);
    if (members === null || stored === null) return;
    const required = Array.isArray(stored.required) ? stored.required : [];
    for (const name of required) {
      if (typeof name === 'string' && ReservedNames.isReservedName(name) && !Object.hasOwn(members, name)) {
        result.addBlueprintComparisonError(
          new ComparisonError(LOCATION, ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, path.add(name), name),
        );
      }
    }
    const properties = InstanceValidator.object(stored.properties) ?? JsonNode.getEmpty();
    for (const [name, value] of Object.entries(members)) {
      const schema = InstanceValidator.object(properties[name]);
      if (InstanceValidator.OWN_TERMS.has(name) || schema === null) continue;
      if (!InstanceValidator.conformsTo(schema, value)) {
        result.addValidationFinding(
          ValidationPolicy.finding('valueShape', path.add(name).toPointer(), 'The template does not admit this value here.'),
        );
      }
    }
    // Where the server's validator asks more than the format does: an identifier stated as a string
    // must be an absolute IRI, the instance's own and its template's at the root, and an occurrence's.
    const identifiers = path.toPointer() === '' ? InstanceValidator.ROOT_IDENTIFIERS : InstanceValidator.OCCURRENCE_IDENTIFIERS;
    for (const name of identifiers) {
      const value = members[name];
      if (typeof value === 'string' && !IdentifierPolicy.isValid(value)) {
        result.addValidationFinding(
          ValidationPolicy.finding('valueShape', path.add(name).toPointer(), 'The server requires an absolute IRI here.'),
        );
      }
    }
  }

  private static readonly ROOT_IDENTIFIERS: readonly string[] = [JsonSchema.atId, JsonSchema.schemaIsBasedOn, JsonSchema.pavDerivedFrom];
  private static readonly OCCURRENCE_IDENTIFIERS: readonly string[] = [JsonSchema.atId, JsonSchema.pavDerivedFrom];

  /**
   * Whether a value meets the schema it is held to: its `oneOf`, `enum`, `type`,
   * `minLength` and `format`, for a list its `items`, `minItems` and
   * `uniqueItems`, and for an object its `properties`, `patternProperties`,
   * `required` and `additionalProperties`. Enough of JSON Schema for a
   * `@context` entry and for the keys of the instance's own.
   */
  private static conformsTo(schema: JsonNode, value: unknown): boolean {
    if (Array.isArray(schema.oneOf)) {
      const options = schema.oneOf
        .map((option) => InstanceValidator.object(option))
        .filter((option): option is JsonNode => option !== null);
      if (options.filter((option) => InstanceValidator.conformsTo(option, value)).length !== 1) return false;
    }
    if (Array.isArray(schema.enum) && !schema.enum.some((option) => JSON.stringify(option) === JSON.stringify(value))) return false;
    const types: unknown[] | null = schema.type === undefined ? null : Array.isArray(schema.type) ? schema.type : [schema.type];
    if (types !== null && !types.some((type) => InstanceValidator.isOfType(type, value))) return false;
    if (typeof value === 'string' && typeof schema.minLength === 'number' && [...value].length < schema.minLength) return false;
    if (typeof value === 'string' && schema.format === 'uri' && !IdentifierPolicy.matchesUriFormat(value)) return false;
    if (typeof value === 'string' && schema.format === 'date-time' && !TimestampPolicy.matchesFormat(value)) return false;
    if (Array.isArray(value)) {
      if (typeof schema.minItems === 'number' && value.length < schema.minItems) return false;
      if (typeof schema.maxItems === 'number' && value.length > schema.maxItems) return false;
      if (schema.uniqueItems === true && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) return false;
      const items = InstanceValidator.object(schema.items);
      if (items !== null && !value.every((item) => InstanceValidator.conformsTo(items, item))) return false;
    }
    const node = InstanceValidator.object(value);
    if (node === null) return true;
    const properties = InstanceValidator.object(schema.properties) ?? JsonNode.getEmpty();
    if (Array.isArray(schema.required) && schema.required.some((key) => typeof key === 'string' && !Object.hasOwn(node, key))) return false;
    const patterns = Object.entries(InstanceValidator.object(schema.patternProperties) ?? JsonNode.getEmpty());
    return Object.entries(node).every(([key, member]) => {
      const declared = InstanceValidator.object(properties[key]);
      const matching = patterns
        .filter(([pattern]) => new RegExp(pattern, 'u').test(key))
        .map(([, patternSchema]) => InstanceValidator.object(patternSchema))
        .filter((patternSchema): patternSchema is JsonNode => patternSchema !== null);
      if (declared !== null || matching.length > 0) {
        return (
          (declared === null || InstanceValidator.conformsTo(declared, member)) &&
          matching.every((patternSchema) => InstanceValidator.conformsTo(patternSchema, member))
        );
      }
      const extra = InstanceValidator.object(schema.additionalProperties);
      return schema.additionalProperties !== false && (extra === null || InstanceValidator.conformsTo(extra, member));
    });
  }

  private static isOfType(type: unknown, value: unknown): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'object':
        return InstanceValidator.object(value) !== null;
      case 'array':
        return Array.isArray(value);
      case 'null':
        return value === null;
      case 'boolean':
        return typeof value === 'boolean';
      case 'number':
        return typeof value === 'number';
      case 'integer':
        return Number.isInteger(value);
      default:
        return true;
    }
  }

  /** A stored schema node, or null for anything that is not one. */
  private static object(node: unknown): JsonNode | null {
    return node !== null && typeof node === 'object' && !Array.isArray(node) ? (node as JsonNode) : null;
  }

  /**
   * The children a container requires its instances to hold. A stored template
   * says so in its `required`, which older templates kept shorter than the
   * model writes it. The instance's own metadata is required there too, and is
   * the server's to write, so it is not asked of an instance here.
   */
  private static requiredChildren(info: ContainerArtifactChildrenInfo, stored: JsonNode | null): string[] {
    if (stored === null) return info.getChildrenNamesForRequiredInProperties();
    const required = Array.isArray(stored.required) ? stored.required : [];
    return required.filter((name): name is string => typeof name === 'string' && !ReservedNames.isReservedName(name));
  }

  /**
   * Whether a container's stored schema admits a key it does not declare. JSON
   * Schema admits one unless `additionalProperties` is false, and holds it to
   * that schema where it is one. Older templates admit further literal values
   * this way without having an attribute-value child.
   */
  private static admitsUndeclared(stored: JsonNode | null, value: InstanceDataAtomType): boolean {
    if (stored === null) return false;
    const additional = stored.additionalProperties;
    if (additional === undefined || additional === true) return true;
    const schema = InstanceValidator.object(additional);
    if (schema === null) return false;
    if (Object.keys(schema).length === 0) return true;
    if (Array.isArray(value) || value instanceof InstanceDataContainer) return false;
    const node =
      value instanceof InstanceDataEmptyAtom && value.hasDiscardedContent()
        ? (value.discarded as JsonNode)
        : JsonTemplateInstanceWriter.writeValueNode(value);
    return node !== null && FieldValuePolicy.validateNode(schema as ValidationField, node).length === 0;
  }

  /** The field's schema, with the properties its value must and may carry taken from the stored one. */
  private static withStoredShape(field: ValidationField, stored: JsonNode | null): ValidationField {
    if (stored === null) return field;
    const properties = InstanceValidator.object(stored.properties);
    return {
      ...field,
      properties: properties ?? undefined,
      required: Array.isArray(stored.required) ? stored.required.filter((key): key is string => typeof key === 'string') : undefined,
      additionalProperties: typeof stored.additionalProperties === 'boolean' ? stored.additionalProperties : undefined,
    };
  }

  /**
   * An attribute-value field's value lists the names of the attributes a user
   * added, and the schema admits nothing else in the list: an entry holding a
   * value, such as `{"@value": null}`, is refused, as is a value that is no
   * list at all. A list of names alone reads as an attribute-value field.
   */
  private static validateAttributeNames(value: InstanceDataAtomType | undefined, path: JsonPath, result: JsonArtifactParsingResult): void {
    if (value === undefined || value instanceof InstanceDataAttributeValueField) return;
    if (!Array.isArray(value)) {
      result.addValidationFinding(
        ValidationPolicy.finding('valueShape', path.toPointer(), 'An attribute-value field holds a list of attribute names.'),
      );
      return;
    }
    value.forEach((entry, index) => {
      if (!(entry instanceof InstanceDataAttributeValueFieldName)) {
        result.addValidationFinding(
          ValidationPolicy.finding('valueShape', path.add(index).toPointer(), 'An attribute-value field lists attribute names only.'),
        );
      }
    });
  }

  private static attributeValueGroups(container: InstanceDataContainer): Array<[string, string[]]> {
    const groups: Array<[string, string[]]> = [];
    for (const [name, value] of Object.entries(container.values)) {
      if (value instanceof InstanceDataAttributeValueField) {
        groups.push([name, Object.keys(value.values)]);
      } else if (Array.isArray(value)) {
        const names = value
          .filter((item): item is InstanceDataAttributeValueFieldName => item instanceof InstanceDataAttributeValueFieldName)
          .map((item) => item.name ?? '')
          .filter((item) => item.length > 0);
        if (names.length > 0) {
          groups.push([name, names]);
        }
      }
    }
    return groups;
  }

  private static validateChild(
    name: string,
    value: InstanceDataAtomType,
    childInfo: AbstractChildDeploymentInfo | null,
    child: unknown,
    path: JsonPath,
    result: JsonArtifactParsingResult,
    stored: JsonNode | null,
    options: InstanceValidationOptions,
  ): void {
    const isMulti = childInfo?.isMultiInAnyWay() ?? false;

    const values: Array<InstanceDataAtomType> | null = Array.isArray(value) ? value : null;
    const isList = values !== null;

    if (isMulti !== isList) {
      result.addBlueprintComparisonError(
        new ComparisonError(
          LOCATION,
          ComparisonErrorType.VALUE_MISMATCH,
          path,
          isMulti ? 'a list of values' : 'a single value',
          isList ? 'a list of values' : 'a single value',
        ),
      );
      // The cardinality is wrong, so per-item checks below would describe the
      // wrong shape. The one finding is the useful one.
      return;
    }

    if (values !== null) {
      InstanceValidator.validateCardinality(values, childInfo, path, result);
      const items = InstanceValidator.object(stored?.items) ?? stored;
      values.forEach((item, index) => InstanceValidator.validateItem(item, child, path.add(index), result, items, options));
      return;
    }

    InstanceValidator.validateItem(value, child, path, result, stored, options);
  }

  private static validateCardinality(
    values: Array<InstanceDataAtomType>,
    childInfo: AbstractChildDeploymentInfo | null,
    path: JsonPath,
    result: JsonArtifactParsingResult,
  ): void {
    if (!(childInfo instanceof AbstractDynamicChildDeploymentInfo)) {
      return;
    }
    const { minItems, maxItems } = childInfo;
    if (minItems !== null && values.length < minItems) {
      result.addValidationFinding(ValidationPolicy.finding('minItems', path.toPointer(), `Fewer than ${minItems} entries.`));
    }
    if (maxItems !== null && values.length > maxItems) {
      result.addValidationFinding(ValidationPolicy.finding('maxItems', path.toPointer(), `More than ${maxItems} entries.`));
    }
  }

  private static validateItem(
    value: InstanceDataAtomType,
    child: unknown,
    path: JsonPath,
    result: JsonArtifactParsingResult,
    stored: JsonNode | null,
    options: InstanceValidationOptions,
  ): void {
    if (child instanceof TemplateElement) {
      if (value instanceof InstanceDataContainer) {
        InstanceValidator.validateContainer(value, child, path, result, stored, options);
      } else if (InstanceValidator.isEmpty(value)) {
        /**
         * An element written as `{}`. The reader classifies that as an empty
         * atom because, with no template, `{}` is indistinguishable from an
         * empty controlled-term field. Here the template says it is an element,
         * and an element holding nothing is missing every child its schema
         * requires — so it is judged as the empty container it is, which names
         * them individually rather than reporting one opaque error.
         */
        const empty = new InstanceDataContainer();
        // As stored, the element's own object held nothing, its @context and @id included.
        StoredForm.recordMembers(empty, {});
        InstanceValidator.validateContainer(empty, child, path, result, stored, options);
      } else {
        result.addBlueprintComparisonError(
          new ComparisonError(LOCATION, ComparisonErrorType.VALUE_MISMATCH, path, 'an element', 'a field value'),
        );
      }
      return;
    }

    if (child instanceof TemplateField) {
      const field = InstanceValidator.withStoredShape(validationFieldSchema(child), stored);
      const at = path.toPointer();
      for (const finding of FieldValuePolicy.validateConfiguration(field, at)) result.addValidationFinding(finding);
      const node = options.asWritten === true ? JsonTemplateInstanceWriter.writeValueNode(value) : InstanceValidator.asStored(value);
      for (const finding of FieldValuePolicy.validateNode(field, node, at)) {
        let diagnostic: ComparisonError | undefined;
        if ((finding.code === 'valueType' || (finding.code === 'missingProperty' && finding.path.endsWith('/@type'))) && node) {
          const expected = field._valueConstraints?.numberType ?? field._valueConstraints?.temporalType;
          diagnostic = new ComparisonError(
            'ValidationPolicy',
            Object.hasOwn(node, '@type') ? ComparisonErrorType.VALUE_MISMATCH : ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
            path.add('@type'),
            expected,
            typeof node['@type'] === 'string' ? node['@type'] : undefined,
          );
        } else if (finding.code === 'iriMalformed' && node && node['@id'] === null) {
          diagnostic = new ComparisonError(
            'ValidationPolicy',
            ComparisonErrorType.MISSING_VALUE_IN_REAL_OBJECT,
            path.add('@id'),
            'an IRI',
            null,
          );
        }
        result.addValidationFinding(finding, 'instance', diagnostic);
      }
      if (
        node &&
        typeof node === 'object' &&
        typeof node['@id'] === 'string' &&
        (FieldValuePolicy.isControlled(field) || FieldValuePolicy.authorityTypes.has(field._ui?.inputType ?? ''))
      ) {
        result.addValidationFinding(
          ValidationPolicy.finding(
            'semanticNotChecked',
            at + '/@id',
            'Identifier membership or existence has not been verified.',
            'notChecked',
          ),
        );
      }
    }
  }

  /**
   * A value as the document stored it, which the writer's form of it can
   * differ from in two ways. An unfilled value can still hold something, such
   * as a null label or a class as `@type`, which the writer makes `{}` of. And
   * the writer leaves out an optional property held as null, which a field may
   * require.
   */
  private static asStored(value: InstanceDataAtomType): JsonNode | null {
    if (value instanceof InstanceDataEmptyAtom && value.hasDiscardedContent()) return value.discarded as JsonNode;
    const node = JsonTemplateInstanceWriter.writeValueNode(value);
    if (node === null || value === null || typeof value !== 'object') return node;
    const nulls = StoredForm.nullsOf(value).filter((key) => !Object.hasOwn(node, key));
    return nulls.length === 0 ? node : { ...node, ...Object.fromEntries(nulls.map((key) => [key, null])) };
  }

  /** An unfilled slot, in any of the shapes the reader produces for one. */
  private static isEmpty(value: InstanceDataAtomType): boolean {
    if (value instanceof InstanceDataEmptyAtom || value instanceof InstanceDataEmptyNode) {
      return true;
    }
    if (value instanceof InstanceDataStringAtom || value instanceof InstanceDataTypedAtom) {
      return value.value === null;
    }
    return false;
  }
}
