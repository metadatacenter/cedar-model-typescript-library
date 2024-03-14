import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { UiInputType } from '../types/wrapped-types/UiInputType';
import { NullableString } from '../types/basic-types/NullableString';
import { NullableNumber } from '../types/basic-types/NullableNumber';

export class ChildDeploymentInfo {
  private readonly _name: string;
  private _label: NullableString = null;
  private _description: NullableString = null;
  private _iri: NullableString = null;
  private _atType: CedarArtifactType = CedarArtifactType.NULL;
  private _uiInputType: UiInputType = UiInputType.NULL;

  private _multiInstance: boolean = false;
  private _minItems: NullableNumber = null;
  private _maxItems: NullableNumber = null;

  private _requiredValue: boolean = false;
  private _hidden: boolean = false;

  public static empty(): ChildDeploymentInfo {
    return new ChildDeploymentInfo('');
  }

  constructor(name: string) {
    this._name = name;
  }

  get name(): string {
    return this._name;
  }

  get atType(): CedarArtifactType {
    return this._atType;
  }

  set atType(value: CedarArtifactType) {
    this._atType = value;
  }

  get uiInputType(): UiInputType {
    return this._uiInputType;
  }

  set uiInputType(value: UiInputType) {
    this._uiInputType = value;
  }

  get label(): NullableString {
    return this._label;
  }

  set label(value: NullableString) {
    this._label = value;
  }

  get description(): NullableString {
    return this._description;
  }

  set description(value: NullableString) {
    this._description = value;
  }

  get iri(): NullableString {
    return this._iri;
  }

  set iri(value: NullableString) {
    this._iri = value;
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

  get requiredValue(): boolean {
    return this._requiredValue;
  }

  set requiredValue(value: boolean) {
    this._requiredValue = value;
  }

  get hidden(): boolean {
    return this._hidden;
  }

  set hidden(value: boolean) {
    this._hidden = value;
  }
}
