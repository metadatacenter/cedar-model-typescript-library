import { CedarArtifactType } from '../types/beans/CedarArtifactType';
import { ValueConstraints } from './ValueConstraints';
import { CedarFieldType } from '../types/beans/CedarFieldType';
import { CedarAbstractArtifact } from '../CedarAbstractArtifact';

export abstract class CedarField extends CedarAbstractArtifact {
  public skos_altLabel: Array<string> | null = null;
  public skos_prefLabel: string | null = null;

  public valueConstraints: ValueConstraints = new ValueConstraints();
  public cedarFieldType: CedarFieldType = CedarFieldType.NULL;
  public cedarArtifactType: CedarArtifactType = CedarArtifactType.NULL;
}
