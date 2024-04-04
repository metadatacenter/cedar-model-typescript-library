import { JSONReaderBehavior } from '../../../behavior/JSONReaderBehavior';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { ReaderUtil } from '../ReaderUtil';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { CedarUser } from '../../../model/cedar/types/cedar-types/CedarUser';
import { ISODate } from '../../../model/cedar/types/wrapped-types/ISODate';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JSONArtifactReaderResult } from './JSONArtifactReaderResult';
import { AbstractInstanceArtifact } from '../../../model/cedar/AbstractInstanceArtifact';

export abstract class JSONAbstractInstanceArtifactReader {
  protected behavior: JSONReaderBehavior;
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.NULL;

  protected constructor(behavior: JSONReaderBehavior) {
    this.behavior = behavior;
  }

  public abstract readFromString(artifactSourceString: string): JSONArtifactReaderResult;

  protected readNonReportableAttributes(container: AbstractInstanceArtifact, sourceObject: JsonNode): void {
    // Read in non-reportable properties
    container.at_id = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, JsonSchema.atId));
    container.schema_name = ReaderUtil.getString(sourceObject, JsonSchema.schemaName);
    container.schema_description = ReaderUtil.getString(sourceObject, JsonSchema.schemaDescription);
    container.pav_createdBy = CedarUser.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavCreatedBy));
    container.pav_createdOn = ISODate.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavCreatedOn));
    container.oslc_modifiedBy = CedarUser.forValue(ReaderUtil.getString(sourceObject, JsonSchema.oslcModifiedBy));
    container.pav_lastUpdatedOn = ISODate.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavLastUpdatedOn));

    container.schema_isBasedOn = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, JsonSchema.schemaIsBasedOn));
  }
}
