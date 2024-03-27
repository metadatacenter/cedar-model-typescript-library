import { ISODate } from './types/wrapped-types/ISODate';
import { CedarUser } from './types/cedar-types/CedarUser';
import { PavVersion } from './types/wrapped-types/PavVersion';
import { BiboStatus } from './types/wrapped-types/BiboStatus';
import { CedarArtifactId } from './types/cedar-types/CedarArtifactId';
import { SchemaVersion } from './types/wrapped-types/SchemaVersion';
import { CedarArtifactType } from './types/cedar-types/CedarArtifactType';
import { Annotations } from './annotation/Annotations';
import { NullableString } from './types/basic-types/NullableString';

export abstract class AbstractArtifact {
  public at_id: CedarArtifactId = CedarArtifactId.NULL;
  public title: NullableString = null;
  public description: NullableString = null;
  public schema_schemaVersion: SchemaVersion = SchemaVersion.NULL;
  // provenance
  public pav_createdOn: ISODate = ISODate.NULL;
  public pav_createdBy: CedarUser = CedarUser.NULL;
  public pav_lastUpdatedOn: ISODate = ISODate.NULL;
  public oslc_modifiedBy: CedarUser = CedarUser.NULL;
  // status and version
  public pav_version: PavVersion = PavVersion.NULL;
  public bibo_status: BiboStatus = BiboStatus.NULL;
  // schema name and description
  public schema_name: NullableString = null;
  public schema_description: NullableString = null;
  public schema_identifier: NullableString = null;
  //
  public cedarArtifactType: CedarArtifactType = CedarArtifactType.NULL;
  //
  public pav_derivedFrom: CedarArtifactId = CedarArtifactId.NULL;
  //
  public annotations: Annotations | null = null;
}
