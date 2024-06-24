import { Iri } from '../../../../../types/wrapped-types/Iri';
import { ControlledTermOntology } from './ControlledTermOntology';

export class ControlledTermOntologyBuilder {
  private acronym: string = '';
  private name: string = '';
  private numTerms: number | null = null;
  private uri: Iri = Iri.empty();

  public withAcronym(acronym: string): ControlledTermOntologyBuilder {
    this.acronym = acronym;
    return this;
  }

  public withName(name: string): ControlledTermOntologyBuilder {
    this.name = name;
    return this;
  }

  public withNumTerms(numTerms: number | null): ControlledTermOntologyBuilder {
    this.numTerms = numTerms;
    return this;
  }

  public withUri(uri: Iri): ControlledTermOntologyBuilder {
    this.uri = uri;
    return this;
  }

  public build(): ControlledTermOntology {
    return new ControlledTermOntology(this.acronym, this.name, this.numTerms, this.uri);
  }
}
