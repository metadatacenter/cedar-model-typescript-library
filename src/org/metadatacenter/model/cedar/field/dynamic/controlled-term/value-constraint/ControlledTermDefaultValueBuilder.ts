import { Iri } from '../../../../types/wrapped-types/Iri';
import { ControlledTermDefaultValue } from './ControlledTermDefaultValue';

export class ControlledTermDefaultValueBuilder {
  private termUri: Iri = Iri.empty();
  private rdfsLabel: string = '';

  public withTermUri(termUri: Iri): ControlledTermDefaultValueBuilder {
    this.termUri = termUri;
    return this;
  }

  public withRdfsLabel(rdfsLabel: string): ControlledTermDefaultValueBuilder {
    this.rdfsLabel = rdfsLabel;
    return this;
  }

  public build(): ControlledTermDefaultValue {
    return new ControlledTermDefaultValue(this.termUri, this.rdfsLabel);
  }
}
