import { AbstractSchemaArtifact } from '../../../model/cedar/AbstractSchemaArtifact';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { CedarUser } from '../../../model/cedar/types/cedar-types/CedarUser';
import { ISODate } from '../../../model/cedar/types/wrapped-types/ISODate';
import { SchemaVersion } from '../../../model/cedar/types/wrapped-types/SchemaVersion';
import { PavVersion } from '../../../model/cedar/types/wrapped-types/PavVersion';
import { BiboStatus } from '../../../model/cedar/types/wrapped-types/BiboStatus';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { Annotations } from '../../../model/cedar/annotation/Annotations';
import { AnnotationAtId } from '../../../model/cedar/annotation/AnnotationAtId';
import { AnnotationAtValue } from '../../../model/cedar/annotation/AnnotationAtValue';
import { YAMLReaderBehavior } from '../../../behavior/YAMLReaderBehavior';
import { ReaderUtil } from '../ReaderUtil';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YamlValues } from '../../../model/cedar/constants/YamlValues';

export abstract class YAMLAbstractArtifactReader {
  protected behavior: YAMLReaderBehavior;
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.NULL;

  protected constructor(behavior: YAMLReaderBehavior) {
    this.behavior = behavior;
  }

  protected readNonReportableAttributes(container: AbstractSchemaArtifact, sourceObject: JsonNode): void {
    // Read in non-reportable properties
    container.at_id = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, YamlKeys.id));
    // TODO: These are lost???
    // container.title = ReaderUtil.getString(sourceObject, TemplateProperty.title);
    // container.description = ReaderUtil.getString(sourceObject, TemplateProperty.description);
    container.schema_name = ReaderUtil.getString(sourceObject, YamlKeys.label);
    container.schema_description = ReaderUtil.getString(sourceObject, YamlKeys.description);
    container.pav_createdBy = CedarUser.forValue(ReaderUtil.getString(sourceObject, YamlKeys.createdBy));
    container.pav_createdOn = ISODate.forValue(ReaderUtil.getString(sourceObject, YamlKeys.createdOn));
    container.oslc_modifiedBy = CedarUser.forValue(ReaderUtil.getString(sourceObject, YamlKeys.modifiedBy));
    container.pav_lastUpdatedOn = ISODate.forValue(ReaderUtil.getString(sourceObject, YamlKeys.lastUpdatedOn));
    container.schema_schemaVersion = SchemaVersion.forValue(ReaderUtil.getString(sourceObject, YamlKeys.modelVersion));
    container.pav_version = PavVersion.forValue(ReaderUtil.getString(sourceObject, YamlKeys.version));
    container.bibo_status = BiboStatus.forYamlValue(ReaderUtil.getString(sourceObject, YamlKeys.status));
    container.pav_derivedFrom = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, YamlKeys.derivedFrom));
    container.schema_identifier = ReaderUtil.getString(sourceObject, YamlKeys.identifier);
  }

  protected readAnnotations(
    artifact: AbstractSchemaArtifact,
    artifactSourceObject: JsonNode,
    _parsingResult: ParsingResult,
    _topPath: JsonPath,
  ) {
    const annotations = new Annotations();
    const annotationsNodeList: JsonNode[] = ReaderUtil.getNodeList(artifactSourceObject, YamlKeys.annotations);
    annotationsNodeList.forEach((annotationNode) => {
      const name: string | null = ReaderUtil.getString(annotationNode, YamlKeys.name);
      const type: string | null = ReaderUtil.getString(annotationNode, YamlKeys.type);
      const value: string | null = ReaderUtil.getString(annotationNode, YamlKeys.value);
      if (name !== null && value !== null) {
        if (type === YamlValues.iri) {
          annotations.add(new AnnotationAtId(name, value));
        } else if (type === YamlValues.string) {
          annotations.add(new AnnotationAtValue(name, value));
        }
      }
    });
    if (annotations.getSize() > 0) {
      artifact.annotations = annotations;
    }
  }
}
