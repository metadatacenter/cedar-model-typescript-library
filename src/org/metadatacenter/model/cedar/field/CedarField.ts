import { SchemaVersion } from '../beans/SchemaVersion';
import { CedarArtifactType } from '../beans/CedarArtifactType';
import { CedarArtifactId } from '../beans/CedarArtifactId';
import { ValueConstraints } from './ValueConstraints';
import { CedarFieldType } from '../beans/CedarFieldType';
import { CedarAbstractArtifact } from '../CedarAbstractArtifact';

export abstract class CedarField extends CedarAbstractArtifact {
  public at_id: CedarArtifactId = CedarArtifactId.NULL;
  public title: string | null = null;
  public description: string | null = null;
  public schema_schemaVersion: SchemaVersion = SchemaVersion.NULL;
  public skos_altLabel: Array<string> | null = null;
  public skos_prefLabel: string | null = null;

  public valueConstraints: ValueConstraints = new ValueConstraints();
  public cedarFieldType: CedarFieldType = CedarFieldType.NULL;
  public cedarArtifactType: CedarArtifactType = CedarArtifactType.NULL;
}
