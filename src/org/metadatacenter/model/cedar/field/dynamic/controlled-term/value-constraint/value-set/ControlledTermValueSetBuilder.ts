import { URI } from '../../../../../types/wrapped-types/URI';
import { ControlledTermValueSet } from './ControlledTermValueSet';

export class ControlledTermValueSetBuilder {
  private _vsCollection: string = '';
  private _name: string = '';
  private _uri: URI = URI.empty();
  private _numTerms: number = 0;

  public withVsCollection(vsCollection: string): ControlledTermValueSetBuilder {
    this._vsCollection = vsCollection;
    return this;
  }

  public withName(name: string): ControlledTermValueSetBuilder {
    this._name = name;
    return this;
  }

  public withUri(uri: URI): ControlledTermValueSetBuilder {
    this._uri = uri;
    return this;
  }

  public withNumTerms(numTerms: number): ControlledTermValueSetBuilder {
    this._numTerms = numTerms;
    return this;
  }

  public build(): ControlledTermValueSet {
    return new ControlledTermValueSet(this._vsCollection, this._name, this._numTerms, this._uri);
  }
}
