import { NullableNumber } from '../types/basic-types/NullableNumber';
import { UiInputType } from '../types/wrapped-types/UiInputType';
import { AbstractChildDeploymentInfo } from './AbstractChildDeploymentInfo';
import { AbstractFieldChildDeploymentInfo } from './AbstractFieldChildDeploymentInfo';

export class ChildDeploymentInfoAlwaysMultiple extends AbstractFieldChildDeploymentInfo {
  private _declaredMinItems: NullableNumber = null;
  private _declaredMaxItems: NullableNumber = null;

  public static empty(): ChildDeploymentInfoAlwaysMultiple {
    return new ChildDeploymentInfoAlwaysMultiple('');
  }

  constructor(name: string) {
    super(name);
  }

  isMultiInAnyWay(): boolean {
    return true;
  }

  get declaredMinItems(): NullableNumber {
    return this._declaredMinItems;
  }

  get declaredMaxItems(): NullableNumber {
    return this._declaredMaxItems;
  }

  set declaredMinItems(value: NullableNumber) {
    this._declaredMinItems = value;
  }

  set declaredMaxItems(value: NullableNumber) {
    this._declaredMaxItems = value;
  }

  /**
   * What the template declared, when it declared anything; otherwise the
   * default for the kind of field.
   *
   * Checkbox and multiple-choice list take one instance. Tying the bound to the
   * requirement said a field nobody has to answer may appear zero times, which is
   * a different contract and not what the system stores: every such field in
   * production carries one. An attribute-value field defaults to zero, since
   * requiring one would mean requiring an attribute nobody has named yet. These
   * fields are multiple by nature, so most templates leave the bounds out and the
   * default is all there is — but a template may state them, and then the
   * statement stands.
   *
   * The JSON writer reads these same accessors — see `WriterUtil.getMultiMinMax`
   * — so a reader of the parsed model and a writer of the JSON cannot drift
   * apart.
   */
  override get minItems(): NullableNumber {
    if (this._declaredMinItems !== null) {
      return this._declaredMinItems;
    }
    return this.defaultMinItems;
  }

  get defaultMinItems(): number {
    if (this.uiInputType === UiInputType.ATTRIBUTE_VALUE) {
      return 0;
    }
    return AbstractChildDeploymentInfo.defaultMinItems;
  }

  override get maxItems(): NullableNumber {
    return this._declaredMaxItems;
  }
}
