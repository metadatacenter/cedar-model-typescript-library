import { NullableNumber } from '../types/basic-types/NullableNumber';
import { AbstractDynamicChildDeploymentInfo } from './AbstractDynamicChildDeploymentInfo';

export class ChildDeploymentInfo extends AbstractDynamicChildDeploymentInfo {
  protected _multiInstance: boolean = false;
  protected _minItems: NullableNumber = null;
  protected _maxItems: NullableNumber = null;

  public static empty(): ChildDeploymentInfo {
    return new ChildDeploymentInfo('');
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

  get minItems(): NullableNumber {
    return this._minItems;
  }

  set minItems(value: NullableNumber) {
    this._minItems = value;
  }

  get maxItems(): NullableNumber {
    return this._maxItems;
  }

  set maxItems(value: NullableNumber) {
    this._maxItems = value;
  }

  isMultiInAnyWay(): boolean {
    return this._multiInstance;
  }
}
