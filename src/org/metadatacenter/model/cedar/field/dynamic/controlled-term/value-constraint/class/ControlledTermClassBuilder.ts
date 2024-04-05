import { Iri } from '../../../../../types/wrapped-types/Iri';
import { ControlledTermClass } from './ControlledTermClass';
import { BioportalTermType } from '../../../../../types/bioportal-types/BioportalTermType';

export class ControlledTermClassBuilder {
  private _label: string = '';
  private _source: string = '';
  private _type: BioportalTermType = BioportalTermType.NULL;
  private _prefLabel: string = '';
  private _uri: Iri = Iri.empty();

  public withLabel(label: string): ControlledTermClassBuilder {
    this._label = label;
    return this;
  }

  public withSource(source: string): ControlledTermClassBuilder {
    this._source = source;
    return this;
  }

  public withType(type: BioportalTermType): ControlledTermClassBuilder {
    this._type = type;
    return this;
  }

  public withPrefLabel(prefLabel: string): ControlledTermClassBuilder {
    this._prefLabel = prefLabel;
    return this;
  }

  public withUri(uri: Iri): ControlledTermClassBuilder {
    this._uri = uri;
    return this;
  }

  public build(): ControlledTermClass {
    return new ControlledTermClass(this._label, this._source, this._type, this._prefLabel, this._uri);
  }
}
