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
    // The writer emits an instance's `pav:derivedFrom` and nothing read it, so a document that named
    // what it was copied from lost that on the way through. The YAML instance reader has always read
    // it; this is the JSON side catching up. Legacy empty strings mean "no source" and are normalized
    // to NULL here so production instances remain openable and the writer omits the bad spelling.
    container.pav_derivedFrom = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavDerivedFrom));
  }
}
