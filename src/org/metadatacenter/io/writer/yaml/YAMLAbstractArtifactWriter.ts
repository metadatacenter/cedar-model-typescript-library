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

export abstract class YAMLAbstractArtifactWriter extends AbstractArtifactWriter {
  protected atomicWriter: YAMLAtomicWriter;
  protected annotationsWriter: YAMLAnnotationsWriter;

  protected constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
    this.atomicWriter = writers.getYAMLAtomicWriter();
    this.annotationsWriter = writers.getYAMLAnnotationsWriter();
  }

  protected macroNameAndDescription(artifact: AbstractArtifact): JsonNode {
    return {
      [YamlKeys.name]: artifact.schema_name,
      [YamlKeys.description]: artifact.schema_description,
    } as JsonNode;
  }

  protected macroStatusAndVersion(artifact: AbstractArtifact, atomicWriter: YAMLAtomicWriter): JsonNode {
    const svObject: JsonNode = JsonNodeClass.getEmpty();
    if (artifact.bibo_status !== BiboStatus.NULL) {
      svObject[YamlKeys.status] = atomicWriter.write(artifact.bibo_status);
    }
    if (artifact.pav_version !== PavVersion.NULL) {
      svObject[YamlKeys.version] = atomicWriter.write(artifact.pav_version);
    }
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

  protected macroProvenance(artifact: AbstractArtifact, atomicWriter: YAMLAtomicWriter): JsonNode {
    return {
      [YamlKeys.createdOn]: atomicWriter.write(artifact.pav_createdOn),
      [YamlKeys.createdBy]: atomicWriter.write(artifact.pav_createdBy),
      [YamlKeys.lastUpdatedOn]: atomicWriter.write(artifact.pav_lastUpdatedOn),
      [YamlKeys.modifiedBy]: atomicWriter.write(artifact.oslc_modifiedBy),
    } as JsonNode;
  }

  protected macroSchemaIdentifier(artifact: AbstractArtifact): JsonNode {
    const schemaIdentifier: JsonNode = JsonNodeClass.getEmpty();
    if (artifact.schema_identifier !== null) {
      schemaIdentifier[YamlKeys.identifier] = artifact.schema_identifier;
    }
    return schemaIdentifier;
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
