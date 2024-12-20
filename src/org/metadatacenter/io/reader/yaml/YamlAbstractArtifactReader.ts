import { AbstractSchemaArtifact } from '../../../model/cedar/AbstractSchemaArtifact';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { CedarUser } from '../../../model/cedar/types/cedar-types/CedarUser';
import { IsoDate } from '../../../model/cedar/types/wrapped-types/IsoDate';
import { SchemaVersion } from '../../../model/cedar/types/wrapped-types/SchemaVersion';
import { PavVersion } from '../../../model/cedar/types/wrapped-types/PavVersion';
import { BiboStatus } from '../../../model/cedar/types/wrapped-types/BiboStatus';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { Annotations } from '../../../model/cedar/annotation/Annotations';
import { AnnotationAtId } from '../../../model/cedar/annotation/AnnotationAtId';
import { AnnotationAtValue } from '../../../model/cedar/annotation/AnnotationAtValue';
import { YamlReaderBehavior } from '../../../behavior/YamlReaderBehavior';
import { ReaderUtil } from '../ReaderUtil';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YamlValues } from '../../../model/cedar/constants/YamlValues';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';
import { Language } from '../../../model/cedar/types/wrapped-types/Language';

export abstract class YamlAbstractArtifactReader {
  protected behavior: YamlReaderBehavior;
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.NULL;

  protected constructor(behavior: YamlReaderBehavior) {
    this.behavior = behavior;
  }

  protected readNonReportableAttributes(container: AbstractSchemaArtifact, sourceObject: JsonNode): void {
    // Read in non-reportable properties
    container.at_id = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, YamlKeys.id));
    // TODO: These are lost???
    // container.title = ReaderUtil.getString(sourceObject, TemplateProperty.title);
    // container.description = ReaderUtil.getString(sourceObject, TemplateProperty.description);
    container.schema_name = ReaderUtil.getString(sourceObject, YamlKeys.name);
    container.schema_description = ReaderUtil.getString(sourceObject, YamlKeys.description);
    container.pav_createdBy = CedarUser.forValue(ReaderUtil.getString(sourceObject, YamlKeys.createdBy));
    container.pav_createdOn = IsoDate.forValue(ReaderUtil.getString(sourceObject, YamlKeys.createdOn));
    container.oslc_modifiedBy = CedarUser.forValue(ReaderUtil.getString(sourceObject, YamlKeys.modifiedBy));
    container.pav_lastUpdatedOn = IsoDate.forValue(ReaderUtil.getString(sourceObject, YamlKeys.modifiedOn));
    container.schema_schemaVersion = SchemaVersion.forValue(ReaderUtil.getString(sourceObject, YamlKeys.modelVersion));
    container.pav_version = PavVersion.forValue(ReaderUtil.getString(sourceObject, YamlKeys.version));
    container.bibo_status = BiboStatus.forYamlValue(ReaderUtil.getString(sourceObject, YamlKeys.status));
    container.pav_derivedFrom = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, YamlKeys.derivedFrom));
    container.pav_previousVersion = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, YamlKeys.previousVersion));
    container.schema_identifier = ReaderUtil.getString(sourceObject, YamlKeys.identifier);
    container.language = Language.forValue(ReaderUtil.getString(sourceObject, YamlKeys.language));
  }

  protected readAnnotations(
    artifact: AbstractSchemaArtifact,
    artifactSourceObject: JsonNode,
    _parsingResult: YamlArtifactParsingResult,
    _topPath: JsonPath,
  ) {
    const annotations = new Annotations();
    const annotationsNode: JsonNode = ReaderUtil.getNode(artifactSourceObject, YamlKeys.annotations);
    Object.keys(annotationsNode).forEach((name: string) => {
      const annotationNode = ReaderUtil.getNode(annotationsNode, name);
      const id: string | null = ReaderUtil.getString(annotationNode, YamlKeys.id);
      const value: string | null = ReaderUtil.getString(annotationNode, YamlKeys.value);
      if (name !== null) {
        if (id !== null) {
          annotations.add(new AnnotationAtId(name, id));
        } else if (value !== null) {
          annotations.add(new AnnotationAtValue(name, value));
        }
      }
    });
    if (annotations.getSize() > 0) {
      artifact.annotations = annotations;
    }
  }
}
