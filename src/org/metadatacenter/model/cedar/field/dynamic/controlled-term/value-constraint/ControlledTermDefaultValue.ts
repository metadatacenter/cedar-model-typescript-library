import { Iri } from '../../../../types/wrapped-types/Iri';

export class ControlledTermDefaultValue {
  private readonly _termUri: Iri;
  private readonly _rdfsLabel: string;

  constructor(termUri: Iri, rdfsLabel: string) {
    this._termUri = termUri;
    this._rdfsLabel = rdfsLabel;
  }

  get termUri(): Iri {
    return this._termUri;
  }

  get rdfsLabel(): string {
    return this._rdfsLabel;
  }
}
