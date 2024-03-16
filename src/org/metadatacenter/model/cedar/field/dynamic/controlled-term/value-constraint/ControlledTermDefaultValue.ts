import { URI } from '../../../../types/wrapped-types/URI';

export class ControlledTermDefaultValue {
  private readonly _termUri: URI;
  private readonly _rdfsLabel: string;

  constructor(termUri: URI, rdfsLabel: string) {
    this._termUri = termUri;
    this._rdfsLabel = rdfsLabel;
  }

  get termUri(): URI {
    return this._termUri;
  }

  get rdfsLabel(): string {
    return this._rdfsLabel;
  }
}
