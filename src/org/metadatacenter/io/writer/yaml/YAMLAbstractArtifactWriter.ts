import { AbstractArtifactWriter } from '../AbstractArtifactWriter';
import { CedarWriters } from '../CedarWriters';
import { YAMLAtomicWriter } from './YAMLAtomicWriter';
import { JSONWriterBehavior } from '../../../behavior/JSONWriterBehavior';
import { AbstractArtifact } from '../../../model/cedar/AbstractArtifact';
import { JsonNode, JsonNodeClass } from '../../../model/cedar/types/basic-types/JsonNode';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { BiboStatus } from '../../../model/cedar/types/wrapped-types/BiboStatus';
import { PavVersion } from '../../../model/cedar/types/wrapped-types/PavVersion';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { YAMLAnnotationsWriter } from './YAMLAnnotationsWriter';
import { CedarUser } from '../../../model/cedar/types/cedar-types/CedarUser';
import { ISODate } from '../../../model/cedar/types/wrapped-types/ISODate';

export abstract class YAMLAbstractArtifactWriter extends AbstractArtifactWriter {
  protected atomicWriter: YAMLAtomicWriter;
  protected annotationsWriter: YAMLAnnotationsWriter;

  protected constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
    this.atomicWriter = writers.getYAMLAtomicWriter();
    this.annotationsWriter = writers.getYAMLAnnotationsWriter();
  }

  protected macroNameAndDescription(artifact: AbstractArtifact): JsonNode {
    const node: JsonNode = JsonNodeClass.getEmpty();
    node[YamlKeys.name] = artifact.schema_name;
    if (artifact.schema_description !== null && artifact.schema_description !== '') {
      node[YamlKeys.description] = artifact.schema_description;
    }
    return node;
  }

  protected macroStatusAndVersion(artifact: AbstractArtifact): JsonNode {
    const svObject: JsonNode = JsonNodeClass.getEmpty();
    if (artifact.bibo_status !== BiboStatus.NULL) {
      svObject[YamlKeys.status] = this.atomicWriter.write(artifact.bibo_status);
    }
    if (artifact.pav_version !== PavVersion.NULL) {
      svObject[YamlKeys.version] = this.atomicWriter.write(artifact.pav_version);
    }
    svObject[YamlKeys.modelVersion] = this.atomicWriter.write(artifact.schema_schemaVersion);
    return svObject;
  }

  protected macroSkos(field: TemplateField): JsonNode {
    const skosObject: JsonNode = JsonNodeClass.getEmpty();
    if (field.skos_prefLabel !== null) {
      skosObject[YamlKeys.label] = field.skos_prefLabel;
    }
    if (field.skos_altLabel !== null && field.skos_altLabel.length > 0) {
      skosObject[YamlKeys.altLabel] = field.skos_altLabel;
    }
    return skosObject;
  }

  protected macroProvenance(artifact: AbstractArtifact): JsonNode {
    const prov = JsonNodeClass.getEmpty();
    if (artifact.pav_createdOn !== ISODate.NULL) {
      prov[YamlKeys.createdOn] = this.atomicWriter.write(artifact.pav_createdOn);
    }
    if (artifact.pav_createdBy !== CedarUser.NULL) {
      prov[YamlKeys.createdBy] = this.atomicWriter.write(artifact.pav_createdBy);
    }
    if (artifact.pav_lastUpdatedOn !== ISODate.NULL) {
      prov[YamlKeys.lastUpdatedOn] = this.atomicWriter.write(artifact.pav_lastUpdatedOn);
    }
    if (artifact.oslc_modifiedBy !== CedarUser.NULL) {
      prov[YamlKeys.modifiedBy] = this.atomicWriter.write(artifact.oslc_modifiedBy);
    }
    return prov;
  }

  protected macroSchemaIdentifier(artifact: AbstractArtifact): JsonNode {
    const schemaIdentifier: JsonNode = JsonNodeClass.getEmpty();
    if (artifact.schema_identifier !== null) {
      schemaIdentifier[YamlKeys.identifier] = artifact.schema_identifier;
    }
    return schemaIdentifier;
  }

  protected macroTypeAndId(artifact: AbstractArtifact): JsonNode {
    const typeAndId: JsonNode = JsonNodeClass.getEmpty();
    typeAndId[YamlKeys.type] = this.atomicWriter.write(artifact.cedarArtifactType);
    if (artifact.at_id !== CedarArtifactId.NULL) {
      typeAndId[YamlKeys.id] = this.atomicWriter.write(artifact.at_id);
    }
    return typeAndId;
  }

  protected macroDerivedFrom(artifact: AbstractArtifact): JsonNode {
    const derivedFrom: JsonNode = JsonNodeClass.getEmpty();
    if (artifact.pav_derivedFrom !== CedarArtifactId.NULL) {
      derivedFrom[YamlKeys.derivedFrom] = this.atomicWriter.write(artifact.pav_derivedFrom);
    }
    return derivedFrom;
  }

  protected macroAnnotations(artifact: AbstractArtifact): JsonNode {
    return this.annotationsWriter.write(artifact.annotations);
  }
}
