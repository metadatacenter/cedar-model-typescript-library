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

const LOCATION = 'InstanceValidator';

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
   */
  public static validate(instance: TemplateInstance, template: Template): JsonArtifactParsingResult {
    const result = new JsonArtifactParsingResult();
    InstanceValidator.validateContainer(instance.dataContainer, template, new JsonPath(), result);
    return result;
  }

  /** Saveability and quality are different answers; semantic checks remain explicitly not checked. */
  public static validateReport(instance: TemplateInstance, template: Template): ValidationSummary {
    return this.validate(instance, template).getValidationReport();
  }

  private static validateContainer(
    container: InstanceDataContainer,
    template: AbstractContainerArtifact,
    path: JsonPath,
    result: JsonArtifactParsingResult,
  ): void {
    const info = template.getChildrenInfo();
    const attributeNames = new Set(
      InstanceValidator.attributeValueGroups(container)
        .filter(([group]) => info.get(group)?.uiInputType === UiInputType.ATTRIBUTE_VALUE)
        .flatMap(([, names]) => names),
    );
    for (const name of Object.keys(container.values)) {
      if (info.get(name) === null && !attributeNames.has(name)) {
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

    for (const name of info.getChildrenNamesForRequiredInProperties()) {
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
        continue;
      }

      const value = container.values[name];
      if (value === undefined) {
        // Already reported above when the template requires it; a child that is
        // not required may legitimately be absent.
        continue;
      }
      InstanceValidator.validateChild(name, value, childInfo, template.getChild(name), path.add(name), result);
    }
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
      values.forEach((item, index) => InstanceValidator.validateItem(item, child, path.add(index), result));
      return;
    }

    InstanceValidator.validateItem(value, child, path, result);
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

  private static validateItem(value: InstanceDataAtomType, child: unknown, path: JsonPath, result: JsonArtifactParsingResult): void {
    if (child instanceof TemplateElement) {
      if (value instanceof InstanceDataContainer) {
        InstanceValidator.validateContainer(value, child, path, result);
      } else if (InstanceValidator.isEmpty(value)) {
        /**
         * An element written as `{}`. The reader classifies that as an empty
         * atom because, with no template, `{}` is indistinguishable from an
         * empty controlled-term field. Here the template says it is an element,
         * and an element holding nothing is missing every child its schema
         * requires — so it is judged as the empty container it is, which names
         * them individually rather than reporting one opaque error.
         */
        InstanceValidator.validateContainer(new InstanceDataContainer(), child, path, result);
      } else {
        result.addBlueprintComparisonError(
          new ComparisonError(LOCATION, ComparisonErrorType.VALUE_MISMATCH, path, 'an element', 'a field value'),
        );
      }
      return;
    }

    if (child instanceof TemplateField) {
      const field = validationFieldSchema(child);
      const at = path.toPointer();
      for (const finding of FieldValuePolicy.validateConfiguration(field, at)) result.addValidationFinding(finding);
      // An unfilled value can still hold something, such as a null label or a class as @type. It is
      // judged as it was stored, the way the Java validator judges it, rather than as the `{}` the
      // writer would make of it.
      const node =
        value instanceof InstanceDataEmptyAtom && value.hasDiscardedContent()
          ? (value.discarded as JsonNode)
          : JsonTemplateInstanceWriter.writeValueNode(value);
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
