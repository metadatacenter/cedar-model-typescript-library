import { ISODate } from './types/wrapped-types/ISODate';
import { CedarUser } from './types/cedar-types/CedarUser';
import { PavVersion } from './types/wrapped-types/PavVersion';
import { BiboStatus } from './types/wrapped-types/BiboStatus';
import { CedarArtifactId } from './types/cedar-types/CedarArtifactId';
import { SchemaVersion } from './types/wrapped-types/SchemaVersion';

export abstract class AbstractArtifact {
  public at_id: CedarArtifactId = CedarArtifactId.NULL;
  public title: string | null = null;
  public description: string | null = null;
  public schema_schemaVersion: SchemaVersion = SchemaVersion.NULL;
  // provenance
  public pav_createdOn: ISODate | null = ISODate.forValue(null);
  public pav_createdBy: CedarUser = CedarUser.forValue(null);
  public pav_lastUpdatedOn: ISODate | null = ISODate.forValue(null);
  public oslc_modifiedBy: CedarUser = CedarUser.forValue(null);
  // status and version
  public pav_version: PavVersion = PavVersion.NULL;
  public bibo_status: BiboStatus = BiboStatus.NULL;
  // schema name and description
  public schema_name: string | null = null;
  public schema_description: string | null = null;
}
