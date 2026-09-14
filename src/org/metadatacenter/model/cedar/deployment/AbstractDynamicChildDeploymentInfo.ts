import { NullableNumber } from '../types/basic-types/NullableNumber';
import { NullableString } from '../types/basic-types/NullableString';
import { AbstractChildDeploymentInfo } from './AbstractChildDeploymentInfo';

export abstract class AbstractDynamicChildDeploymentInfo extends AbstractChildDeploymentInfo {
  protected _iri: NullableString = null;

  protected constructor(name: string) {
    super(name);
  }

  get iri(): NullableString {
    return this._iri;
  }

  set iri(value: NullableString) {
    this._iri = value;
  }

  /**
   * Whether the parent asks for a value, and how firmly.
   *
   * A field records that in its own `_valueConstraints`. An element has no `_valueConstraints` at
   * all, and the parent's `required` array lists every child that is not static or attribute-value
   * whatever the author asked for, so an element child has nowhere to keep a requirement — these
   * answer for it, and only a field's deployment info can set one.
   */
  get requiredValue(): boolean {
    return false;
  }

  get recommendedValue(): boolean {
    return false;
  }

  abstract isMultiInAnyWay(): boolean;

  /**
   * How many instances of this child the template allows.
   *
   * Answerable for every dynamic child, not only the ones whose cardinality is
   * spelled out in the schema: a checkbox or a multiple-choice list is multiple
   * by definition and its bounds follow from `requiredValue`, and an
   * attribute-value field always starts at zero. `WriterUtil.getMultiMinMax`
   * knew those rules but kept them to itself, so a consumer reading the parsed
   * model saw nothing where the template — and the JSON either library writes
   * — has `minItems`. Null means unbounded.
   */
  get minItems(): NullableNumber {
    return null;
  }

  get maxItems(): NullableNumber {
    return null;
  }
}
