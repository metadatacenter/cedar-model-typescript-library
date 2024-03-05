import { CedarArtifactType } from './CedarArtifactType';

export class CedarContainerChildInfo {
  private readonly _name: string;
  private _label: string | null = null;
  private _description: string | null = null;
  private _iri: string | null = null;
  private _atType: CedarArtifactType = CedarArtifactType.NULL;

  private _multiInstance: boolean = false;
  private _minItems: number | null = null;
  private _maxItems: number | null = null;

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

  get multiInstance(): boolean {
    return this._multiInstance;
  }

  set multiInstance(value: boolean) {
    this._multiInstance = value;
  }

  get minItems(): number | null {
    return this._minItems;
  }

  set minItems(value: number | null) {
    this._minItems = value;
  }

  get maxItems(): number | null {
    return this._maxItems;
  }

  set maxItems(value: number | null) {
    this._maxItems = value;
  }
}
