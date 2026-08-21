import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { UiInputType } from '../types/wrapped-types/UiInputType';
import { NullableString } from '../types/basic-types/NullableString';

export abstract class AbstractChildDeploymentInfo {
  protected readonly _name: string;
  protected _atType: CedarArtifactType = CedarArtifactType.NULL;
  protected _uiInputType: UiInputType = UiInputType.NULL;

  protected _label: NullableString = null;
  protected _description: NullableString = null;

  /**
   * `_ui.hidden`, which any child can carry — element and static alike, not
   * only the dynamic fields that used to declare it. It lived on the dynamic
   * subclass, so a hidden element or a hidden static field parsed as visible
   * and any consumer rendering from the parsed model showed it.
   */
  protected _hidden: boolean = false;

  protected constructor(name: string) {
    this._name = name;
  }

  get name(): string {
    return this._name;
  }

  /**
   * Whether this describes a child held by a parent.
   *
   * A parent names every child it holds, so an unnamed deployment is the one a field written on its
   * own carries: nothing decides anything about it, because nothing holds it. What a parent decides —
   * the override labels, the cardinality, a static field's display size — is written only for a child.
   */
  hasParent(): boolean {
    return this._name !== '';
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

  get hidden(): boolean {
    return this._hidden;
  }

  set hidden(value: boolean) {
    this._hidden = value;
  }

  abstract isMultiInAnyWay(): boolean;
}
