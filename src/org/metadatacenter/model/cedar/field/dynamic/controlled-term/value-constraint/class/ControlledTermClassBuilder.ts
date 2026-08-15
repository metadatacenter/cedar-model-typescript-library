import { Iri } from '../../../../../types/wrapped-types/Iri';
import { ControlledTermClass } from './ControlledTermClass';
import { ValueConstraintRequirements } from '../ValueConstraintRequirements';
import { ControlledTermVersion } from '../ControlledTermVersion';
import { BioportalTermType } from '../../../../../types/bioportal-types/BioportalTermType';

export class ControlledTermClassBuilder {
  private _label: string = '';
  private _source: string = '';
  private _type: BioportalTermType = BioportalTermType.NULL;
  private _prefLabel: string = '';
  private _uri: Iri = Iri.empty();
  private _iri: Iri | null = null;
  private _sourceSystem: string | null = null;
  private _version: ControlledTermVersion | null = null;

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

  /** The source ontology's canonical identity, which holds whichever system serves it. */
  public withIri(iri: Iri | null): ControlledTermClassBuilder {
    this._iri = iri;
    return this;
  }

  /** The system serving the vocabulary; null means BioPortal. */
  public withSourceSystem(sourceSystem: string | null): ControlledTermClassBuilder {
    this._sourceSystem = sourceSystem;
    return this;
  }

  /** The snapshot this entry is pinned to; null resolves against the latest. */
  public withVersion(version: ControlledTermVersion | null): ControlledTermClassBuilder {
    this._version = version;
    return this;
  }

  public build(): ControlledTermClass {
    ValueConstraintRequirements.requireIri(this._uri, 'a URI', 'A class constraint');
    ValueConstraintRequirements.requireText(this._label, 'a label', 'A class constraint');
    ValueConstraintRequirements.requireText(this._prefLabel, 'a preferred label', 'A class constraint');
    ValueConstraintRequirements.requireText(this._source, 'a source', 'A class constraint');
    ValueConstraintRequirements.requireTermType(this._type, 'A class constraint');
    return new ControlledTermClass(
      this._label,
      this._source,
      this._type,
      this._prefLabel,
      this._uri,
      this._iri,
      this._sourceSystem,
      this._version,
    );
  }
}
