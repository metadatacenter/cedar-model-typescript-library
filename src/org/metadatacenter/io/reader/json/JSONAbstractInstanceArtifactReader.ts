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
import { JSONAbstractArtifactReader } from './JSONAbstractArtifactReader';

export abstract class JSONAbstractInstanceArtifactReader extends JSONAbstractArtifactReader {
  protected constructor(behavior: JSONReaderBehavior) {
    super(behavior);
  }

  public abstract readFromString(artifactSourceString: string): JSONArtifactReaderResult;

  protected readNonReportableAttributes(container: AbstractInstanceArtifact, sourceObject: JsonNode): void {
    super.readNonReportableAttributes(container, sourceObject);
    container.schema_isBasedOn = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, JsonSchema.schemaIsBasedOn));
  }
}
