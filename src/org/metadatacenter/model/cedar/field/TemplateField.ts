import { ValueConstraints } from './ValueConstraints';
import { CedarFieldType } from '../types/cedar-types/CedarFieldType';
import { AbstractSchemaArtifact } from '../AbstractSchemaArtifact';

export abstract class TemplateField extends AbstractSchemaArtifact {
  public skos_altLabel: Array<string> | null = null;
  public skos_prefLabel: string | null = null;

  public valueConstraints: ValueConstraints = new ValueConstraints();
  public cedarFieldType: CedarFieldType = CedarFieldType.NULL;

  override isMultiInstanceByDefinition(): boolean {
    return false;
  }

  override isSingleInstanceByDefinition(): boolean {
    return false;
  }
}
