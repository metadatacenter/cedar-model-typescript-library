import { TemplateInstance } from './TemplateInstance';
import { InstanceDataContainer } from './InstanceDataContainer';
import { InstanceDataAtomType } from './InstanceDataAtomType';
import { InstanceDataEmptyAtom } from './InstanceDataEmptyAtom';
import { InstanceDataEmptyNode } from './InstanceDataEmptyNode';
import { InstanceDataStringAtom } from './InstanceDataStringAtom';
import { InstanceDataTypedAtom } from './InstanceDataTypedAtom';
import { InstanceDataAttributeValueField } from './InstanceDataAttributeValueField';
import { InstanceDataLinkAtom } from './InstanceDataLinkAtom';
import { InstanceDataControlledAtom } from './InstanceDataControlledAtom';
import { AbstractContainerArtifact } from '../AbstractContainerArtifact';
import { AbstractChildDeploymentInfo } from '../deployment/AbstractChildDeploymentInfo';
import { AbstractDynamicChildDeploymentInfo } from '../deployment/AbstractDynamicChildDeploymentInfo';
import { TemplateElement } from '../element/TemplateElement';
import { Template } from '../template/Template';
import { TemporalFieldImpl } from '../field/dynamic/temporal/TemporalFieldImpl';
import { NumericFieldImpl } from '../field/dynamic/numeric/NumericFieldImpl';
import { JsonArtifactParsingResult } from '../util/compare/JsonArtifactParsingResult';
import { ComparisonError } from '../util/compare/ComparisonError';
import { ComparisonErrorType } from '../util/compare/ComparisonErrorType';
import { JsonPath } from '../util/path/JsonPath';
import { JsonSchema } from '../constants/JsonSchema';
import { UiInputType } from '../types/wrapped-types/UiInputType';

const LOCATION = 'InstanceValidator';

/**
 * Check a parsed instance against the template that defines it.
 *
 * Reading an instance answers no question about whether it is *correct*. The
 * reader takes a JSON document at face value — it is handed no template, so a
 * field that has lost its `@type`, an element short of its `minItems`, or a
 * property the template requires and the document omits all parse cleanly. The
 * verdict on those needs the template, which is what this takes.
 *
 * It is deliberately the counterpart of `InstanceInflater`: the same walk over
 * the same pairing of container and template, but reporting what is wrong
 * instead of repairing it. Where the inflater re-adds a missing slot, this
 * records that it was missing.
 *
 * ## What is checked
 *
 *  - **presence** — every child the template lists in its JSON Schema
 *    `required` has a slot. Static fields and attribute-value fields are
 *    excluded, exactly as `getChildrenNamesForRequiredInProperties` excludes
 *    them from `required` itself.
 *  - **cardinality** — a multi child holds an array and a single child does
 *    not, and the array's length sits within `minItems`/`maxItems`.
 *  - **value type** — a temporal or numeric value carries the `@type` its
 *    field declares. These are the two field kinds whose instance
 *    representation is a typed atom, so they are the two where a missing or
 *    wrong `@type` is unambiguous rather than a matter of interpretation.
 *  - **elements** — recursively, on the same terms.
 *
 * ## What is deliberately not checked
 *
 * An empty slot is valid. A property must be *present*, but `null` is a legal
 * value for one — that is how CEDAR represents "not filled in", and the
 * template's own schema permits it. So emptiness is never an error here; only
 * absence is.
 *
 * Emptiness has a legal spelling, though, and `{"@id": null}` is not it. A
 * literal's `@value` may be null; an `@id` may not, and an unfilled link is
 * written `{}`. That asymmetry is checked — see `validateIri`.
 *
 * Nor does this police the atom kind of every field. Only temporal and numeric
 * fields have a declared datatype to check against. Inferring the rest from
 * `uiInputType` would mean asserting things the model does not actually
 * constrain, and a validator that reports errors which are not errors is worse
 * than one that stays quiet: consumers stop believing it. Widening the check is
 * a matter of adding cases here as the model gains constraints worth enforcing.
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

  private static validateContainer(
    container: InstanceDataContainer,
    template: AbstractContainerArtifact,
    path: JsonPath,
    result: JsonArtifactParsingResult,
  ): void {
    const info = template.getChildrenInfo();

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

  private static validateChild(
    name: string,
    value: InstanceDataAtomType,
    childInfo: AbstractChildDeploymentInfo | null,
    child: unknown,
    path: JsonPath,
    result: JsonArtifactParsingResult,
  ): void {
    const isMulti = childInfo?.isMultiInAnyWay() ?? false;

    /**
     * An empty list is not read as an empty array: `[]` comes back as an
     * `InstanceDataAttributeValueField`, because with no template in hand the
     * reader cannot tell one from the other. On a child the template declares
     * multi, it can only be the empty list, so it is counted as one — otherwise
     * every unfilled multi child reads as a cardinality mismatch. Worth
     * revisiting in the reader; treating it here keeps the false positive out
     * of the verdict meanwhile.
     */
    const values: Array<InstanceDataAtomType> | null = Array.isArray(value)
      ? value
      : isMulti && value instanceof InstanceDataAttributeValueField
        ? []
        : null;
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
      result.addBlueprintComparisonError(
        new ComparisonError(LOCATION, ComparisonErrorType.MISSING_INDEX_IN_REAL_OBJECT, path, minItems, values.length),
      );
    }
    if (maxItems !== null && values.length > maxItems) {
      result.addBlueprintComparisonError(
        new ComparisonError(LOCATION, ComparisonErrorType.UNEXPECTED_INDEX_IN_REAL_OBJECT, path, maxItems, values.length),
      );
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

    InstanceValidator.validateIri(value, path, result);

    const expectedType = InstanceValidator.declaredValueType(child);
    if (expectedType !== null) {
      InstanceValidator.validateTypedValue(value, expectedType, path, result);
    }
  }

  /**
   * `{"@id": null}` is not an empty value. It is a malformed one.
   *
   * `@value` and `@id` are not symmetrical here, and the difference is easy to
   * miss. A literal's `@value` may be null — JSON-LD allows it and CEDAR
   * declares the property `["string", "null"]`, which is how an unfilled
   * literal is written. An `@id` may not: JSON-LD requires an IRI, and CEDAR
   * declares it `{"type": "string", "format": "uri"}` with no null branch. An
   * unfilled link or controlled-term field is written `{}` instead, which the
   * reader returns as an empty node.
   *
   * So a link atom carrying a null id came from a document that should not
   * exist, and nothing else notices: the reader accepts it and the writer emits
   * it back unchanged. None of the 120 instances in the shared corpus contains
   * one.
   *
   * This is a structural rule rather than a datatype one, so it applies to any
   * field. The instance's own top-level `@id` is a different matter — an unsaved
   * instance legitimately has none — and is not reached here, which walks only
   * the children the template declares.
   */
  private static validateIri(value: InstanceDataAtomType, path: JsonPath, result: JsonArtifactParsingResult): void {
    const hasNullIri =
      (value instanceof InstanceDataLinkAtom || value instanceof InstanceDataControlledAtom) && value.id === null;
    if (hasNullIri) {
      result.addBlueprintComparisonError(
        new ComparisonError(LOCATION, ComparisonErrorType.MISSING_VALUE_IN_REAL_OBJECT, path.add(JsonSchema.atId), 'an IRI', null),
      );
    }
  }

  /**
   * The `@type` a filled value of this field must carry, or null where the
   * field kind declares none.
   */
  private static declaredValueType(child: unknown): string | null {
    if (child instanceof TemporalFieldImpl) {
      return child.valueConstraints.temporalType.getValue();
    }
    if (child instanceof NumericFieldImpl) {
      return child.valueConstraints.numberType.getValue();
    }
    return null;
  }

  private static validateTypedValue(
    value: InstanceDataAtomType,
    expectedType: string,
    path: JsonPath,
    result: JsonArtifactParsingResult,
  ): void {
    if (InstanceValidator.isEmpty(value)) {
      return;
    }

    if (value instanceof InstanceDataTypedAtom) {
      if (value.value !== null && value.type !== expectedType) {
        result.addBlueprintComparisonError(
          new ComparisonError(
            LOCATION,
            ComparisonErrorType.VALUE_MISMATCH,
            path.add(JsonSchema.atType),
            expectedType,
            value.type ?? undefined,
          ),
        );
      }
      return;
    }

    /**
     * A filled value that parsed as a plain string atom never had an `@type` to
     * read. This is the shape an editor produces when it writes the value back
     * and drops the type alongside it: the document stays well formed, the
     * value survives, and only the schema knows anything is wrong.
     */
    if (value instanceof InstanceDataStringAtom && value.value !== null) {
      result.addBlueprintComparisonError(
        new ComparisonError(LOCATION, ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, path.add(JsonSchema.atType), expectedType),
      );
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
