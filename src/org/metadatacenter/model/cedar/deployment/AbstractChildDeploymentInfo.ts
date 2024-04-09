import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { UiInputType } from '../types/wrapped-types/UiInputType';
import { NullableString } from '../types/basic-types/NullableString';

export abstract class AbstractChildDeploymentInfo {
  protected readonly _name: string;
  protected _atType: CedarArtifactType = CedarArtifactType.NULL;
  protected _uiInputType: UiInputType = UiInputType.NULL;

  protected _label: NullableString = null;
  protected _description: NullableString = null;

  public constructor(name: string) {
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

  abstract isMultiInAnyWay(): boolean;
}
