import { IsoDate } from './types/wrapped-types/IsoDate';
import { CedarUser } from './types/cedar-types/CedarUser';
import { CedarArtifactId } from './types/cedar-types/CedarArtifactId';
import { CedarArtifactType } from './types/cedar-types/CedarArtifactType';
import { NullableString } from './types/basic-types/NullableString';
import { Annotations } from './annotation/Annotations';

export abstract class AbstractArtifact {
  public at_id: CedarArtifactId = CedarArtifactId.NULL;
  // provenance
  public pav_createdOn: IsoDate = IsoDate.NULL;
  public pav_createdBy: CedarUser = CedarUser.NULL;
  public pav_lastUpdatedOn: IsoDate = IsoDate.NULL;
  public oslc_modifiedBy: CedarUser = CedarUser.NULL;
  public pav_derivedFrom: CedarArtifactId = CedarArtifactId.NULL;

  // schema name and description
  public schema_name: NullableString = null;
  public schema_description: NullableString = null;
  //
  public cedarArtifactType: CedarArtifactType = CedarArtifactType.NULL;

  //
  public annotations: Annotations | null = null;
}
