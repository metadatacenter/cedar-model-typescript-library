import { Iri } from '../../../../../types/wrapped-types/Iri';
import { ControlledTermOntology } from './ControlledTermOntology';
import { ValueConstraintRequirements } from '../ValueConstraintRequirements';
import { ControlledTermVersion } from '../ControlledTermVersion';

export class ControlledTermOntologyBuilder {
  private acronym: string = '';
  private name: string = '';
  private numTerms: number | null = null;
  private uri: Iri = Iri.empty();
  private iri: Iri | null = null;
  private sourceSystem: string | null = null;
  private version: ControlledTermVersion | null = null;

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

  /** The source ontology's canonical identity, which holds whichever system serves it. */
  public withIri(iri: Iri | null): ControlledTermOntologyBuilder {
    this.iri = iri;
    return this;
  }

  /** The system serving the vocabulary; null means BioPortal. */
  public withSourceSystem(sourceSystem: string | null): ControlledTermOntologyBuilder {
    this.sourceSystem = sourceSystem;
    return this;
  }

  /** The snapshot this entry is pinned to; null resolves against the latest. */
  public withVersion(version: ControlledTermVersion | null): ControlledTermOntologyBuilder {
    this.version = version;
    return this;
  }

  public build(): ControlledTermOntology {
    ValueConstraintRequirements.requireIri(this.uri, 'a URI', 'An ontology constraint');
    ValueConstraintRequirements.requireText(this.acronym, 'an acronym', 'An ontology constraint');
    ValueConstraintRequirements.requireText(this.name, 'a name', 'An ontology constraint');
    return new ControlledTermOntology(this.acronym, this.name, this.numTerms, this.uri, this.iri, this.sourceSystem, this.version);
  }
}
