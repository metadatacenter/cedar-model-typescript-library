import { JsonReaderBehavior } from '../../../behavior/JsonReaderBehavior';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { ReaderUtil } from '../ReaderUtil';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { JsonArtifactReaderResult } from './JsonArtifactReaderResult';
import { AbstractInstanceArtifact } from '../../../model/cedar/AbstractInstanceArtifact';
import { JsonAbstractArtifactReader } from './JsonAbstractArtifactReader';

export abstract class JsonAbstractInstanceArtifactReader extends JsonAbstractArtifactReader {
  protected constructor(behavior: JsonReaderBehavior) {
    super(behavior);
  }

  public abstract readFromString(artifactSourceString: string): JsonArtifactReaderResult;

  protected readNonReportableAttributes(container: AbstractInstanceArtifact, sourceObject: JsonNode): void {
    super.readNonReportableAttributes(container, sourceObject);
    container.schema_isBasedOn = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, JsonSchema.schemaIsBasedOn));
  }
}
