import { JsonReaderBehavior } from '../../../behavior/JsonReaderBehavior';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { ReaderUtil } from '../ReaderUtil';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { CedarUser } from '../../../model/cedar/types/cedar-types/CedarUser';
import { IsoDate } from '../../../model/cedar/types/wrapped-types/IsoDate';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JsonArtifactReaderResult } from './JsonArtifactReaderResult';
import { AbstractArtifact } from '../../../model/cedar/AbstractArtifact';
import { AbstractSchemaArtifact } from '../../../model/cedar/AbstractSchemaArtifact';
import { JsonArtifactParsingResult } from '../../../model/cedar/util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { Annotations } from '../../../model/cedar/annotation/Annotations';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { AnnotationAtId } from '../../../model/cedar/annotation/AnnotationAtId';
import { AnnotationAtValue } from '../../../model/cedar/annotation/AnnotationAtValue';

export abstract class JsonAbstractArtifactReader {
  protected behavior: JsonReaderBehavior;
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.NULL;

  protected constructor(behavior: JsonReaderBehavior) {
    this.behavior = behavior;
  }

  public abstract readFromString(artifactSourceString: string): JsonArtifactReaderResult;

  protected readNonReportableAttributes(container: AbstractArtifact, sourceObject: JsonNode): void {
    // Read in non-reportable properties
    container.at_id = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, JsonSchema.atId));
    container.schema_name = ReaderUtil.getString(sourceObject, JsonSchema.schemaName);
    container.schema_description = ReaderUtil.getString(sourceObject, JsonSchema.schemaDescription);
    container.pav_createdBy = CedarUser.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavCreatedBy));
    container.pav_createdOn = IsoDate.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavCreatedOn));
    container.oslc_modifiedBy = CedarUser.forValue(ReaderUtil.getString(sourceObject, JsonSchema.oslcModifiedBy));
    container.pav_lastUpdatedOn = IsoDate.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavLastUpdatedOn));
  }

  protected readAnnotations(artifact: AbstractArtifact, artifactSourceObject: JsonNode) {
    const annotations = new Annotations();
    const annotationsNode: JsonNode | null = ReaderUtil.getNodeOrNull(artifactSourceObject, CedarModel.annotations);
    if (annotationsNode !== null) {
      Object.keys(annotationsNode).forEach((key) => {
        const annotationNode: JsonNode = ReaderUtil.getNode(annotationsNode, key);
        const atId: string | null = ReaderUtil.getString(annotationNode, JsonSchema.atId);
        if (atId !== null) {
          annotations.add(new AnnotationAtId(key, atId));
        } else {
          const atValue: string | null = ReaderUtil.getString(annotationNode, JsonSchema.atValue);
          if (atValue !== null) {
            annotations.add(new AnnotationAtValue(key, atValue));
          }
        }
      });
    }
    if (annotations.getSize() > 0) {
      artifact.annotations = annotations;
    }
  }
}
