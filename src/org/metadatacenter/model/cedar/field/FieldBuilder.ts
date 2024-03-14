import { AbstractArtifactBuilder } from '../AbstractArtifacBuilder';
import { CedarField } from './CedarField';

export abstract class FieldBuilder extends AbstractArtifactBuilder {
  protected skos_altLabel: Array<string> | null = null;
  protected skos_prefLabel: string | null = null;

  withAlternateLabels(altLabels: Array<string> | null): this {
    this.skos_altLabel = altLabels;
    return this;
  }

  addAlternateLabel(label: string): this {
    if (this.skos_altLabel === null) {
      this.skos_altLabel = [];
    }
    this.skos_altLabel.push(label);
    return this;
  }

  withPreferredLabel(prefLabel: string | null): this {
    this.skos_prefLabel = prefLabel;
    return this;
  }

  protected buildInternal(artifact: CedarField): void {
    super.buildInternal(artifact);
    artifact.skos_altLabel = this.skos_altLabel;
    artifact.skos_prefLabel = this.skos_prefLabel;
  }
}
