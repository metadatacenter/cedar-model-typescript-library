import { AbstractArtifact } from '../../model/cedar/AbstractArtifact';
import { JsonNode, JsonNodeClass } from '../../model/cedar/types/basic-types/JsonNode';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { JSONAtomicWriter } from './JSONAtomicWriter';
import { BiboStatus } from '../../model/cedar/types/wrapped-types/BiboStatus';
import { PavVersion } from '../../model/cedar/types/wrapped-types/PavVersion';
import { TemplateField } from '../../model/cedar/field/TemplateField';
import { CedarModel } from '../../model/cedar/constants/CedarModel';
import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';
import { CedarWriters } from './CedarWriters';
import { CedarArtifactId } from '../../model/cedar/types/cedar-types/CedarArtifactId';

export abstract class AbstractArtifactWriter {
  protected behavior: JSONWriterBehavior;
  protected writers: CedarWriters;
  protected atomicWriter: JSONAtomicWriter;

  protected constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    this.behavior = behavior;
    this.writers = writers;
    this.atomicWriter = writers.getJSONAtomicWriter();
  }

  protected macroSchemaNameAndDescription(artifact: AbstractArtifact): JsonNode {
    return {
      [JsonSchema.schemaName]: artifact.schema_name,
      [JsonSchema.schemaDescription]: artifact.schema_description,
    } as JsonNode;
  }

  protected macroProvenance(artifact: AbstractArtifact, atomicWriter: JSONAtomicWriter): JsonNode {
    return {
      [JsonSchema.pavCreatedOn]: atomicWriter.write(artifact.pav_createdOn),
      [JsonSchema.pavCreatedBy]: atomicWriter.write(artifact.pav_createdBy),
      [JsonSchema.pavLastUpdatedOn]: atomicWriter.write(artifact.pav_lastUpdatedOn),
      [JsonSchema.oslcModifiedBy]: atomicWriter.write(artifact.oslc_modifiedBy),
    } as JsonNode;
  }

  protected macroStatusAndVersion(artifact: AbstractArtifact, atomicWriter: JSONAtomicWriter): JsonNode {
    const svObject: JsonNode = JsonNodeClass.getEmpty();
    if (artifact.bibo_status !== BiboStatus.NULL) {
      svObject[JsonSchema.biboStatus] = atomicWriter.write(artifact.bibo_status);
    }
    if (artifact.pav_version !== PavVersion.NULL) {
      svObject[JsonSchema.pavVersion] = atomicWriter.write(artifact.pav_version);
    }
    return svObject;
  }

  protected macroSkos(field: TemplateField): JsonNode {
    const skosObject: JsonNode = JsonNodeClass.getEmpty();
    if (field.skos_altLabel !== null && field.skos_altLabel.length > 0) {
      skosObject[CedarModel.skosAltLabel] = field.skos_altLabel;
    }
    if (field.skos_prefLabel !== null) {
      skosObject[CedarModel.skosPrefLabel] = field.skos_prefLabel;
    }
    return skosObject;
  }

  protected macroDerivedFrom(artifact: AbstractArtifact) {
    const derivedFrom: JsonNode = JsonNodeClass.getEmpty();
    if (artifact.pav_derivedFrom !== CedarArtifactId.NULL) {
      derivedFrom[JsonSchema.pavDerivedFrom] = this.atomicWriter.write(artifact.pav_derivedFrom);
    }
    return derivedFrom;
  }
}
