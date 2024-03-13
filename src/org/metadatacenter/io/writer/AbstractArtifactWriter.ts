import { CedarAbstractArtifact } from '../../model/cedar/CedarAbstractArtifact';
import { JsonNode, JsonNodeClass } from '../../model/cedar/types/basic-types/JsonNode';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { JSONAtomicWriter } from './JSONAtomicWriter';
import { BiboStatus } from '../../model/cedar/types/beans/BiboStatus';
import { PavVersion } from '../../model/cedar/types/beans/PavVersion';
import { CedarField } from '../../model/cedar/field/CedarField';
import { CedarModel } from '../../model/cedar/constants/CedarModel';
import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';
import { CedarWriters } from './CedarWriters';

export abstract class AbstractArtifactWriter {
  private behavior: JSONWriterBehavior;
  protected writers: CedarWriters;
  protected atomicWriter: JSONAtomicWriter;

  protected constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    this.behavior = behavior;
    this.writers = writers;
    this.atomicWriter = writers.getJSONAtomicWriter();
  }

  protected macroSchemaNameAndDescription(artifact: CedarAbstractArtifact): JsonNode {
    const ndObject: JsonNode = {
      [JsonSchema.schemaName]: artifact.schema_name,
      [JsonSchema.schemaDescription]: artifact.schema_description,
    };
    return ndObject;
  }

  protected macroProvenance(artifact: CedarAbstractArtifact, atomicWriter: JSONAtomicWriter): JsonNode {
    const provObject: JsonNode = {
      [JsonSchema.pavCreatedOn]: atomicWriter.write(artifact.pav_createdOn),
      [JsonSchema.pavCreatedBy]: atomicWriter.write(artifact.pav_createdBy),
      [JsonSchema.pavLastUpdatedOn]: atomicWriter.write(artifact.pav_lastUpdatedOn),
      [JsonSchema.oslcModifiedBy]: atomicWriter.write(artifact.oslc_modifiedBy),
    };
    return provObject;
  }

  protected macroStatusAndVersion(artifact: CedarAbstractArtifact, atomicWriter: JSONAtomicWriter): JsonNode {
    const svObject: JsonNode = JsonNodeClass.getEmpty();
    if (artifact.bibo_status !== BiboStatus.NULL) {
      svObject[JsonSchema.biboStatus] = atomicWriter.write(artifact.bibo_status);
    }
    if (artifact.pav_version !== PavVersion.NULL) {
      svObject[JsonSchema.pavVersion] = atomicWriter.write(artifact.pav_version);
    }
    return svObject;
  }

  protected macroSkos(field: CedarField): JsonNode {
    const skosObject: JsonNode = JsonNodeClass.getEmpty();
    if (field.skos_altLabel !== null && field.skos_altLabel.length > 0) {
      skosObject[CedarModel.skosAltLabel] = field.skos_altLabel;
    }
    if (field.skos_prefLabel !== null) {
      skosObject[CedarModel.skosPrefLabel] = field.skos_prefLabel;
    }
    return skosObject;
  }
}
