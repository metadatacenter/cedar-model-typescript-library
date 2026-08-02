import { NullableNumber } from '../types/basic-types/NullableNumber';
import { UiInputType } from '../types/wrapped-types/UiInputType';
import { AbstractDynamicChildDeploymentInfo } from './AbstractDynamicChildDeploymentInfo';

export class ChildDeploymentInfoAlwaysMultiple extends AbstractDynamicChildDeploymentInfo {
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
   * Checkbox and multiple-choice list default to one when the field is
   * required and zero otherwise; an attribute-value field defaults to zero,
   * since requiring one would mean requiring an attribute nobody has named
   * yet. These fields are multiple by nature, so most templates leave the
   * bounds out and the default is all there is — but a template may state them,
   * and then the statement stands. `template-029` declares `minItems: 1` on a
   * list that is not required; the Java artifact library keeps the 1 and this
   * one used to replace it with the default 0, which was the only place the two
   * libraries disagreed across the whole numbered corpus.
   *
   * The JSON writer reads these same accessors — see `WriterUtil.getMultiMinMax`
   * — so a reader of the parsed model and a writer of the JSON cannot drift
   * apart.
   */
  override get minItems(): NullableNumber {
    if (this._declaredMinItems !== null) {
      return this._declaredMinItems;
    }
    if (this.uiInputType === UiInputType.ATTRIBUTE_VALUE) {
      return 0;
    }
    return this.requiredValue ? 1 : 0;
  }

  override get maxItems(): NullableNumber {
    return this._declaredMaxItems;
  }
}
