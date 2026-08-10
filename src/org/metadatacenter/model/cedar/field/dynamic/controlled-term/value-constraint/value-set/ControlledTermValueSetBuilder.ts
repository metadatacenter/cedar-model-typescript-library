import { Iri } from '../../../../../types/wrapped-types/Iri';
import { ControlledTermValueSet } from './ControlledTermValueSet';
import { ValueConstraintRequirements } from '../ValueConstraintRequirements';

export class ControlledTermValueSetBuilder {
  private _vsCollection: string = '';
  private _name: string = '';
  private _uri: Iri = Iri.empty();
  private _numTerms: number = 0;

  public withVsCollection(vsCollection: string): ControlledTermValueSetBuilder {
    this._vsCollection = vsCollection;
    return this;
  }

  public withName(name: string): ControlledTermValueSetBuilder {
    this._name = name;
    return this;
  }

  public withUri(uri: Iri): ControlledTermValueSetBuilder {
    this._uri = uri;
    return this;
  }

  public withNumTerms(numTerms: number): ControlledTermValueSetBuilder {
    this._numTerms = numTerms;
    return this;
  }

  public build(): ControlledTermValueSet {
    ValueConstraintRequirements.requireIri(this._uri, 'a URI', 'A value-set constraint');
    ValueConstraintRequirements.requireText(this._vsCollection, 'a value-set collection', 'A value-set constraint');
    ValueConstraintRequirements.requireText(this._name, 'a name', 'A value-set constraint');
    return new ControlledTermValueSet(this._vsCollection, this._name, this._numTerms, this._uri);
  }
}
