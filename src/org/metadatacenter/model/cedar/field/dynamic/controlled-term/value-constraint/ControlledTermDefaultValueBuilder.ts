import { Iri } from '../../../../types/wrapped-types/Iri';
import { ControlledTermDefaultValue } from './ControlledTermDefaultValue';
import { ValueConstraintRequirements } from './ValueConstraintRequirements';

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
    ValueConstraintRequirements.requireIri(this.termUri, 'a term URI', 'A controlled-term default value');
    ValueConstraintRequirements.requireText(this.rdfsLabel, 'a label', 'A controlled-term default value');
    return new ControlledTermDefaultValue(this.termUri, this.rdfsLabel);
  }
}
