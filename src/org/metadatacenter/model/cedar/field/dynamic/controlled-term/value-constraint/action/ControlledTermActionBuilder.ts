import { Iri } from '../../../../../types/wrapped-types/Iri';
import { ControlledTermAction } from './ControlledTermAction';
import { BioportalTermType } from '../../../../../types/bioportal-types/BioportalTermType';

export class ControlledTermActionBuilder {
  private _to: number | null = null;
  private _action: string = '';
  private _termUri: Iri = Iri.empty();
  private _sourceUri: Iri = Iri.empty();
  private _source: string = '';
  private _type: BioportalTermType = BioportalTermType.NULL;

  public withTo(to: number | null): ControlledTermActionBuilder {
    this._to = to;
    return this;
  }

  public withAction(action: string): ControlledTermActionBuilder {
    this._action = action;
    return this;
  }

  public withTermUri(termUri: Iri): ControlledTermActionBuilder {
    this._termUri = termUri;
    return this;
  }

  public withSourceUri(sourceUri: Iri): ControlledTermActionBuilder {
    this._sourceUri = sourceUri;
    return this;
  }

  public withSource(source: string): ControlledTermActionBuilder {
    this._source = source;
    return this;
  }

  public withType(type: BioportalTermType): ControlledTermActionBuilder {
    this._type = type;
    return this;
  }

  public build(): ControlledTermAction {
    return new ControlledTermAction(this._to, this._action, this._termUri, this._sourceUri, this._source, this._type);
  }
}
