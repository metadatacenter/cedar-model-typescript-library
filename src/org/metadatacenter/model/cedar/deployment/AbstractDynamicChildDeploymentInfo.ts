import { NullableString } from '../types/basic-types/NullableString';
import { AbstractChildDeploymentInfo } from './AbstractChildDeploymentInfo';

export abstract class AbstractDynamicChildDeploymentInfo extends AbstractChildDeploymentInfo {
  protected _iri: NullableString = null;

  protected _requiredValue: boolean = false;
  private _recommendedValue: boolean = false;
  protected _hidden: boolean = false;
  protected _continuePreviousLine: boolean = false;

  protected constructor(name: string) {
    super(name);
  }

  get iri(): NullableString {
    return this._iri;
  }

  set iri(value: NullableString) {
    this._iri = value;
  }

  get requiredValue(): boolean {
    return this._requiredValue;
  }

  set requiredValue(value: boolean) {
    this._requiredValue = value;
  }

  get recommendedValue(): boolean {
    return this._recommendedValue;
  }

  set recommendedValue(value: boolean) {
    this._recommendedValue = value;
  }

  get hidden(): boolean {
    return this._hidden;
  }

  set hidden(value: boolean) {
    this._hidden = value;
  }

  get continuePreviousLine(): boolean {
    return this._continuePreviousLine;
  }

  set continuePreviousLine(value: boolean) {
    this._continuePreviousLine = value;
  }

  abstract isMultiInAnyWay(): boolean;
}
