import { Iri } from '../../../../../types/wrapped-types/Iri';
import { ControlledTermBranch } from './ControlledTermBranch';

export class ControlledTermBranchBuilder {
  private _source: string = '';
  private _acronym: string = '';
  private _name: string = '';
  private _uri: Iri = Iri.empty();
  private _maxDepth: number = 0;

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

  public build(): ControlledTermBranch {
    return new ControlledTermBranch(this._source, this._acronym, this._name, this._maxDepth, this._uri);
  }
}
