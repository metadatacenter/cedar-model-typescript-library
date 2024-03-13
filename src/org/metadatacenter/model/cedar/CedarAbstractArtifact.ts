import { CedarDate } from './types/beans/CedarDate';
import { CedarUser } from './types/beans/CedarUser';
import { PavVersion } from './types/beans/PavVersion';
import { BiboStatus } from './types/beans/BiboStatus';
import { CedarArtifactId } from './types/beans/CedarArtifactId';
import { SchemaVersion } from './types/beans/SchemaVersion';

export abstract class CedarAbstractArtifact {
  public at_id: CedarArtifactId = CedarArtifactId.NULL;
  public title: string | null = null;
  public description: string | null = null;
  public schema_schemaVersion: SchemaVersion = SchemaVersion.NULL;
  // provenance
  public pav_createdOn: CedarDate | null = CedarDate.forValue(null);
  public pav_createdBy: CedarUser = CedarUser.forValue(null);
  public pav_lastUpdatedOn: CedarDate | null = CedarDate.forValue(null);
  public oslc_modifiedBy: CedarUser = CedarUser.forValue(null);
  // status and version
  public pav_version: PavVersion = PavVersion.NULL;
  public bibo_status: BiboStatus = BiboStatus.NULL;
  // schema name and description
  public schema_name: string | null = null;
  public schema_description: string | null = null;
}
