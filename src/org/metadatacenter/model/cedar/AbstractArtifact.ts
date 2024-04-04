import { ISODate } from './types/wrapped-types/ISODate';
import { CedarUser } from './types/cedar-types/CedarUser';
import { CedarArtifactId } from './types/cedar-types/CedarArtifactId';
import { CedarArtifactType } from './types/cedar-types/CedarArtifactType';
import { NullableString } from './types/basic-types/NullableString';

export abstract class AbstractArtifact {
  public at_id: CedarArtifactId = CedarArtifactId.NULL;
  // provenance
  public pav_createdOn: ISODate = ISODate.NULL;
  public pav_createdBy: CedarUser = CedarUser.NULL;
  public pav_lastUpdatedOn: ISODate = ISODate.NULL;
  public oslc_modifiedBy: CedarUser = CedarUser.NULL;
  // schema name and description
  public schema_name: NullableString = null;
  public schema_description: NullableString = null;
  //
  public cedarArtifactType: CedarArtifactType = CedarArtifactType.NULL;
}
