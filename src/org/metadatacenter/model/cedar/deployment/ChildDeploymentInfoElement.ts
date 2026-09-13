import { NullableNumber } from '../types/basic-types/NullableNumber';
import { AbstractDynamicChildDeploymentInfo } from './AbstractDynamicChildDeploymentInfo';

/**
 * What a parent decides about an element it holds: the labels it overrides, the
 * property IRI it assigns, whether it is required or recommended, and how many
 * instances of it the parent allows.
 *
 * The cardinality repeats what `ChildDeploymentInfo` holds for a field, which is
 * the price of keeping `continuePreviousLine` off an element — that setting sits
 * on `AbstractFieldChildDeploymentInfo`, and an element child descends from the
 * dynamic child directly so it cannot reach it.
 */
export class ChildDeploymentInfoElement extends AbstractDynamicChildDeploymentInfo {
  private _multiInstance: boolean = false;
  private _minItems: NullableNumber = null;
  private _maxItems: NullableNumber = null;

  public static empty(): ChildDeploymentInfoElement {
    return new ChildDeploymentInfoElement('');
  }

  constructor(name: string) {
    super(name);
  }

  get multiInstance(): boolean {
    return this._multiInstance;
  }

  set multiInstance(value: boolean) {
    this._multiInstance = value;
  }

  override get minItems(): NullableNumber {
    return this._minItems;
  }

  set minItems(value: NullableNumber) {
    this._minItems = value;
  }

  override get maxItems(): NullableNumber {
    return this._maxItems;
  }

  set maxItems(value: NullableNumber) {
    this._maxItems = value;
  }

  isMultiInAnyWay(): boolean {
    return this._multiInstance;
  }
}
