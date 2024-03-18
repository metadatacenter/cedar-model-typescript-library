import { URI } from '../../../../../types/wrapped-types/URI';
import { ControlledTermClass } from './ControlledTermClass';

export class ControlledTermClassBuilder {
  private _label: string = '';
  private _source: string = '';
  private _type: string = '';
  private _prefLabel: string = '';
  private _uri: URI = URI.empty();

  public withLabel(label: string): ControlledTermClassBuilder {
    this._label = label;
    return this;
  }

  public withSource(source: string): ControlledTermClassBuilder {
    this._source = source;
    return this;
  }

  public withType(type: string): ControlledTermClassBuilder {
    this._type = type;
    return this;
  }

  public withPrefLabel(prefLabel: string): ControlledTermClassBuilder {
    this._prefLabel = prefLabel;
    return this;
  }

  public withUri(uri: URI): ControlledTermClassBuilder {
    this._uri = uri;
    return this;
  }

  public build(): ControlledTermClass {
    return new ControlledTermClass(this._label, this._source, this._type, this._prefLabel, this._uri);
  }
}
