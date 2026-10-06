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
    ReaderUtil.getArtifactIdentifier(sourceObject, JsonSchema.atId, this.lenient);
    super.readNonReportableAttributes(container, sourceObject);
    container.schema_isBasedOn = CedarArtifactId.forValue(
      ReaderUtil.getArtifactIdentifier(sourceObject, JsonSchema.schemaIsBasedOn, this.lenient),
    );
    // The writer emits an instance's `pav:derivedFrom` and nothing read it, so a document that named
    // what it was copied from lost that on the way through. The YAML instance reader has always read
    // it; this is the JSON side catching up. A compatibility reader takes a legacy empty string as
    // "no source", so the writer omits the bad spelling; a strict one refuses it, as Java does.
    container.pav_derivedFrom = CedarArtifactId.forValue(
      ReaderUtil.getArtifactIdentifier(sourceObject, JsonSchema.pavDerivedFrom, this.lenient),
    );
  }
}
