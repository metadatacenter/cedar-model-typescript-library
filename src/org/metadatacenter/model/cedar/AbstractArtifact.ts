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
  /**
   * The artifact's description, empty when it has none.
   *
   * Never null: `schema:description` is a string wherever the model is serialized, so an artifact
   * with no description carries an empty one. A null reached a document as `"schema:description":
   * null`, which nothing downstream accepts, and made the same artifact read from JSON and from
   * YAML differ - the YAML reader has always supplied an empty string here.
   */
  public schema_description: string = '';
  //
  public cedarArtifactType: CedarArtifactType = CedarArtifactType.NULL;

  //
  public annotations: Annotations | null = null;
}
