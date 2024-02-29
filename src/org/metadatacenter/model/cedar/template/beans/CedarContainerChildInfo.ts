import { CedarArtifactType } from './CedarArtifactTypeValue';
import { name } from 'ts-jest/dist/transformers/hoist-jest';

export class CedarContainerChildInfo {
  private _name: string;
  private _label: string | null = null;
  private _description: string | null = null;
  private _iri: string | null = null;
  private _atType: CedarArtifactType = CedarArtifactType.NULL;

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

  get label(): string | null {
    return this._label;
  }

  set label(value: string | null) {
    this._label = value;
  }

  get description(): string | null {
    return this._description;
  }

  set description(value: string | null) {
    this._description = value;
  }

  get iri(): string | null {
    return this._iri;
  }

  set iri(value: string | null) {
    this._iri = value;
  }
}
