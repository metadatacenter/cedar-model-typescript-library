import { URI } from '../../../../types/wrapped-types/URI';
import { ControlledTermDefaultValue } from './ControlledTermDefaultValue';

export class ControlledTermDefaultValueBuilder {
  private termUri: URI = URI.empty();
  private rdfsLabel: string = '';

  public withTermUri(termUri: URI): ControlledTermDefaultValueBuilder {
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
