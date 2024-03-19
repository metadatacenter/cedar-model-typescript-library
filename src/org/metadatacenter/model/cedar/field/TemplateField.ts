import { ValueConstraints } from './ValueConstraints';
import { CedarFieldType } from '../types/cedar-types/CedarFieldType';
import { AbstractArtifact } from '../AbstractArtifact';

export abstract class TemplateField extends AbstractArtifact {
  public skos_altLabel: Array<string> | null = null;
  public skos_prefLabel: string | null = null;

  public valueConstraints: ValueConstraints = new ValueConstraints();
  public cedarFieldType: CedarFieldType = CedarFieldType.NULL;
}
