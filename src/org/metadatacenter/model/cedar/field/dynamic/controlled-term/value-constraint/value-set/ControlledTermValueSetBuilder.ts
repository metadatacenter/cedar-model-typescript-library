import { Iri } from '../../../../../types/wrapped-types/Iri';
import { ControlledTermValueSet } from './ControlledTermValueSet';
import { ValueConstraintRequirements } from '../ValueConstraintRequirements';
import { ControlledTermVersion } from '../ControlledTermVersion';

export class ControlledTermValueSetBuilder {
  private _vsCollection: string = '';
  private _name: string = '';
  private _uri: Iri = Iri.empty();
  private _numTerms: number | null = null;
  private _iri: Iri | null = null;
  private _sourceSystem: string | null = null;
  private _version: ControlledTermVersion | null = null;

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

  /** How many terms the set holds; null where that is not known, as on the ontology builder. */
  public withNumTerms(numTerms: number | null): ControlledTermValueSetBuilder {
    this._numTerms = numTerms;
    return this;
  }

  /** The source ontology's canonical identity, which holds whichever system serves it. */
  public withIri(iri: Iri | null): ControlledTermValueSetBuilder {
    this._iri = iri;
    return this;
  }

  /** The system serving the vocabulary; null means BioPortal. */
  public withSourceSystem(sourceSystem: string | null): ControlledTermValueSetBuilder {
    this._sourceSystem = sourceSystem;
    return this;
  }

  /** The snapshot this entry is pinned to; null resolves against the latest. */
  public withVersion(version: ControlledTermVersion | null): ControlledTermValueSetBuilder {
    this._version = version;
    return this;
  }

  public build(): ControlledTermValueSet {
    ValueConstraintRequirements.requireIri(this._uri, 'a URI', 'A value-set constraint');
    ValueConstraintRequirements.requireText(this._vsCollection, 'a value-set collection', 'A value-set constraint');
    ValueConstraintRequirements.requireText(this._name, 'a name', 'A value-set constraint');
    return new ControlledTermValueSet(
      this._vsCollection,
      this._name,
      this._numTerms,
      this._uri,
      this._iri,
      this._sourceSystem,
      this._version,
    );
  }
}
