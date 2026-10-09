import { NullableNumber } from '../types/basic-types/NullableNumber';
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
   * Checkbox and multiple-choice list start with none. These fields are multiple because of what
   * they are rather than because anyone declared several, so nobody declared how many they begin
   * with either, and choosing nothing from one is a state a reader can mean. An occupant there
   * would stand for a selection nobody made, and reaches a host as a null entry in the value
   * array. An attribute-value field starts with none for its own reason: requiring one would mean
   * requiring an attribute nobody has named yet, so its builder refuses a minimum above 0.
   *
   * A child someone marked multiple starts with none as well when it states no bound, since
   * `AbstractChildDeploymentInfo.defaultMinItems` is zero for every repeated child. A template may
   * state a bound for either, and then the statement stands.
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
    return AbstractChildDeploymentInfo.defaultMinItems;
  }

  override get maxItems(): NullableNumber {
    return this._declaredMaxItems;
  }
}
