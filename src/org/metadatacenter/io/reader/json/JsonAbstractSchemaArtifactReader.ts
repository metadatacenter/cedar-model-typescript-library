import { JsonReaderBehavior } from '../../../behavior/JsonReaderBehavior';
import { AbstractSchemaArtifact } from '../../../model/cedar/AbstractSchemaArtifact';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { ReaderUtil } from '../ReaderUtil';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { TemplateProperty } from '../../../model/cedar/constants/TemplateProperty';
import { SchemaVersion } from '../../../model/cedar/types/wrapped-types/SchemaVersion';
import { PavVersion } from '../../../model/cedar/types/wrapped-types/PavVersion';
import { BiboStatus } from '../../../model/cedar/types/wrapped-types/BiboStatus';
import { JsonArtifactReaderResult } from './JsonArtifactReaderResult';
import { JsonAbstractArtifactReader } from './JsonAbstractArtifactReader';

export abstract class JsonAbstractSchemaArtifactReader extends JsonAbstractArtifactReader {
  protected constructor(behavior: JsonReaderBehavior) {
    super(behavior);
  }

  public abstract readFromString(artifactSourceString: string): JsonArtifactReaderResult;

  protected readNonReportableAttributes(container: AbstractSchemaArtifact, sourceObject: JsonNode): void {
    super.readNonReportableAttributes(container, sourceObject);
    container.title = ReaderUtil.getString(sourceObject, TemplateProperty.title);
    container.description = ReaderUtil.getString(sourceObject, TemplateProperty.description);
    container.schema_schemaVersion = SchemaVersion.forValue(ReaderUtil.getString(sourceObject, JsonSchema.schemaVersion));
    container.pav_version = PavVersion.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavVersion));
    container.bibo_status = BiboStatus.forJsonValue(ReaderUtil.getString(sourceObject, JsonSchema.biboStatus));
    container.pav_derivedFrom = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavDerivedFrom));
    container.pav_previousVersion = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavPreviousVersion));
    container.schema_identifier = ReaderUtil.getString(sourceObject, JsonSchema.schemaIdentifier);
  }
}
