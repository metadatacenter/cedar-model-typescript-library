import { JSONReaderBehavior } from '../../behavior/JSONReaderBehavior';
import { AbstractArtifact } from '../../model/cedar/AbstractArtifact';
import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactId } from '../../model/cedar/types/cedar-types/CedarArtifactId';
import { ReaderUtil } from './ReaderUtil';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { TemplateProperty } from '../../model/cedar/constants/TemplateProperty';
import { CedarUser } from '../../model/cedar/types/cedar-types/CedarUser';
import { ISODate } from '../../model/cedar/types/wrapped-types/ISODate';
import { SchemaVersion } from '../../model/cedar/types/wrapped-types/SchemaVersion';
import { PavVersion } from '../../model/cedar/types/wrapped-types/PavVersion';
import { BiboStatus } from '../../model/cedar/types/wrapped-types/BiboStatus';
import { CedarArtifactType } from '../../model/cedar/types/cedar-types/CedarArtifactType';

export abstract class JSONAbstractArtifactReader {
  protected behavior: JSONReaderBehavior;
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.NULL;

  protected constructor(behavior: JSONReaderBehavior) {
    this.behavior = behavior;
  }

  protected readNonReportableAttributes(container: AbstractArtifact, sourceObject: JsonNode): void {
    // Read in non-reportable properties
    container.at_id = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, JsonSchema.atId));
    container.title = ReaderUtil.getString(sourceObject, TemplateProperty.title);
    container.description = ReaderUtil.getString(sourceObject, TemplateProperty.description);
    container.schema_name = ReaderUtil.getString(sourceObject, JsonSchema.schemaName);
    container.schema_description = ReaderUtil.getString(sourceObject, JsonSchema.schemaDescription);
    container.pav_createdBy = CedarUser.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavCreatedBy));
    container.pav_createdOn = ISODate.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavCreatedOn));
    container.oslc_modifiedBy = CedarUser.forValue(ReaderUtil.getString(sourceObject, JsonSchema.oslcModifiedBy));
    container.pav_lastUpdatedOn = ISODate.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavLastUpdatedOn));
    container.schema_schemaVersion = SchemaVersion.forValue(ReaderUtil.getString(sourceObject, JsonSchema.schemaVersion));
    container.pav_version = PavVersion.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavVersion));
    container.bibo_status = BiboStatus.forValue(ReaderUtil.getString(sourceObject, JsonSchema.biboStatus));
  }
}
