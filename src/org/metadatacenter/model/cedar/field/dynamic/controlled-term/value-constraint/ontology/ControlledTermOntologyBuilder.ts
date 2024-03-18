import { URI } from '../../../../../types/wrapped-types/URI';
import { ControlledTermOntology } from './ControlledTermOntology';

export class ControlledTermOntologyBuilder {
  private acronym: string = '';
  private name: string = '';
  private numTerms: number = 0;
  private uri: URI = URI.empty();

  public withAcronym(acronym: string): ControlledTermOntologyBuilder {
    this.acronym = acronym;
    return this;
  }

  public withName(name: string): ControlledTermOntologyBuilder {
    this.name = name;
    return this;
  }

  public withNumTerms(numTerms: number): ControlledTermOntologyBuilder {
    this.numTerms = numTerms;
    return this;
  }

  public withUri(uri: URI): ControlledTermOntologyBuilder {
    this.uri = uri;
    return this;
  }

  public build(): ControlledTermOntology {
    return new ControlledTermOntology(this.acronym, this.name, this.numTerms, this.uri);
  }
}
