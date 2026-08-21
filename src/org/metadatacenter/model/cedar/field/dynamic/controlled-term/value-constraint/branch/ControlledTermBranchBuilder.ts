import { Iri } from '../../../../../types/wrapped-types/Iri';
import { ControlledTermBranch } from './ControlledTermBranch';
import { ValueConstraintRequirements } from '../ValueConstraintRequirements';
import { ControlledTermVersion } from '../ControlledTermVersion';

export class ControlledTermBranchBuilder {
  private _source: string = '';
  private _acronym: string = '';
  private _name: string = '';
  private _uri: Iri = Iri.empty();
  private _maxDepth: number = 0;
  private _iri: Iri | null = null;
  private _sourceSystem: string | null = null;
  private _version: ControlledTermVersion | null = null;

  public withSource(source: string): ControlledTermBranchBuilder {
    this._source = source;
    return this;
  }

  public withAcronym(acronym: string): ControlledTermBranchBuilder {
    this._acronym = acronym;
    return this;
  }

  public withName(name: string): ControlledTermBranchBuilder {
    this._name = name;
    return this;
  }

  public withUri(uri: Iri): ControlledTermBranchBuilder {
    this._uri = uri;
    return this;
  }

  public withMaxDepth(maxDepth: number): ControlledTermBranchBuilder {
    this._maxDepth = maxDepth;
    return this;
  }

  /** The source ontology's canonical identity, which holds whichever system serves it. */
  public withIri(iri: Iri | null): ControlledTermBranchBuilder {
    this._iri = iri;
    return this;
  }

  /** The system serving the vocabulary; null means BioPortal. */
  public withSourceSystem(sourceSystem: string | null): ControlledTermBranchBuilder {
    this._sourceSystem = sourceSystem;
    return this;
  }

  /** The snapshot this entry is pinned to; null resolves against the latest. */
  public withVersion(version: ControlledTermVersion | null): ControlledTermBranchBuilder {
    this._version = version;
    return this;
  }

  public build(): ControlledTermBranch {
    ValueConstraintRequirements.requireIri(this._uri, 'a URI', 'A branch constraint');
    ValueConstraintRequirements.requireText(this._source, 'a source', 'A branch constraint');
    ValueConstraintRequirements.requireText(this._acronym, 'an acronym', 'A branch constraint');
    ValueConstraintRequirements.requireText(this._name, 'a name', 'A branch constraint');
    return new ControlledTermBranch(
      this._source,
      this._acronym,
      this._name,
      this._maxDepth,
      this._uri,
      this._iri,
      this._sourceSystem,
      this._version,
    );
  }
}
