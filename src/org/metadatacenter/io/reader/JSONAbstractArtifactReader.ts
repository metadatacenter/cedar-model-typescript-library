import { JSONReaderBehavior } from '../../behavior/JSONReaderBehavior';
import { CedarAbstractArtifact } from '../../model/cedar/CedarAbstractArtifact';
import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactId } from '../../model/cedar/types/beans/CedarArtifactId';
import { ReaderUtil } from './ReaderUtil';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { TemplateProperty } from '../../model/cedar/constants/TemplateProperty';
import { CedarUser } from '../../model/cedar/types/beans/CedarUser';
import { CedarDate } from '../../model/cedar/types/beans/CedarDate';
import { SchemaVersion } from '../../model/cedar/types/beans/SchemaVersion';
import { PavVersion } from '../../model/cedar/types/beans/PavVersion';
import { BiboStatus } from '../../model/cedar/types/beans/BiboStatus';

export abstract class JSONAbstractArtifactReader {
  protected behavior: JSONReaderBehavior;

  protected constructor(behavior: JSONReaderBehavior) {
    this.behavior = behavior;
  }

  protected static readNonReportableAttributes(container: CedarAbstractArtifact, sourceObject: JsonNode): void {
    // Read in non-reportable properties
    container.at_id = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, JsonSchema.atId));
    container.title = ReaderUtil.getString(sourceObject, TemplateProperty.title);
    container.description = ReaderUtil.getString(sourceObject, TemplateProperty.description);
    container.schema_name = ReaderUtil.getString(sourceObject, JsonSchema.schemaName);
    container.schema_description = ReaderUtil.getString(sourceObject, JsonSchema.schemaDescription);
    container.pav_createdBy = CedarUser.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavCreatedBy));
    container.pav_createdOn = CedarDate.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavCreatedOn));
    container.oslc_modifiedBy = CedarUser.forValue(ReaderUtil.getString(sourceObject, JsonSchema.oslcModifiedBy));
    container.pav_lastUpdatedOn = CedarDate.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavLastUpdatedOn));
    container.schema_schemaVersion = SchemaVersion.forValue(ReaderUtil.getString(sourceObject, JsonSchema.schemaVersion));
    container.pav_version = PavVersion.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavVersion));
    container.bibo_status = BiboStatus.forValue(ReaderUtil.getString(sourceObject, JsonSchema.biboStatus));
  }
}
