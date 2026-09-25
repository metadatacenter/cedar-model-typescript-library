import { ValueConstraints } from './ValueConstraints';
import { CedarFieldType } from '../types/cedar-types/CedarFieldType';
import { AbstractSchemaArtifact } from '../AbstractSchemaArtifact';

export abstract class TemplateField extends AbstractSchemaArtifact {
  public skos_altLabel: Array<string> | null = null;
  public skos_prefLabel: string | null = null;

  /**
   * What a field written on its own says about itself, where a child says it through the
   * container's deployment info instead.
   *
   * A container states whether a child of it is hidden and whether that child demands a value, so
   * for a child these live on the deployment info and not here. A field written on its own has no
   * container to say either, and the model had nowhere to keep them: reading one lost both, and
   * the JSON came back with the field shown and optional however it was stored.
   */
  public hidden: boolean = false;
  public requiredValue: boolean = false;
  public recommendedValue: boolean = false;
  public continuePreviousLine: boolean = false;

  public valueConstraints: ValueConstraints = new ValueConstraints();
  public cedarFieldType: CedarFieldType = CedarFieldType.NULL;

  override isMultiInstanceByDefinition(): boolean {
    return false;
  }

  override isSingleInstanceByDefinition(): boolean {
    return false;
  }

  supportsValueRecommendation(): boolean {
    return false;
  }
}
