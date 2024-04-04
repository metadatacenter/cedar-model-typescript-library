import { JSONReaderBehavior } from '../../../behavior/JSONReaderBehavior';
import { AbstractSchemaArtifact } from '../../../model/cedar/AbstractSchemaArtifact';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { ReaderUtil } from '../ReaderUtil';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { TemplateProperty } from '../../../model/cedar/constants/TemplateProperty';
import { CedarUser } from '../../../model/cedar/types/cedar-types/CedarUser';
import { ISODate } from '../../../model/cedar/types/wrapped-types/ISODate';
import { SchemaVersion } from '../../../model/cedar/types/wrapped-types/SchemaVersion';
import { PavVersion } from '../../../model/cedar/types/wrapped-types/PavVersion';
import { BiboStatus } from '../../../model/cedar/types/wrapped-types/BiboStatus';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { Annotations } from '../../../model/cedar/annotation/Annotations';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { AnnotationAtId } from '../../../model/cedar/annotation/AnnotationAtId';
import { AnnotationAtValue } from '../../../model/cedar/annotation/AnnotationAtValue';
import { JSONArtifactReaderResult } from './JSONArtifactReaderResult';

export abstract class JSONAbstractSchemaArtifactReader {
  protected behavior: JSONReaderBehavior;
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.NULL;

  protected constructor(behavior: JSONReaderBehavior) {
    this.behavior = behavior;
  }

  public abstract readFromString(artifactSourceString: string): JSONArtifactReaderResult;

  protected readNonReportableAttributes(container: AbstractSchemaArtifact, sourceObject: JsonNode): void {
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
    container.bibo_status = BiboStatus.forJsonValue(ReaderUtil.getString(sourceObject, JsonSchema.biboStatus));
    container.pav_derivedFrom = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, JsonSchema.pavDerivedFrom));
    container.schema_identifier = ReaderUtil.getString(sourceObject, JsonSchema.schemaIdentifier);
  }

  protected readAnnotations(
    artifact: AbstractSchemaArtifact,
    artifactSourceObject: JsonNode,
    _parsingResult: ParsingResult,
    _topPath: JsonPath,
  ) {
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
