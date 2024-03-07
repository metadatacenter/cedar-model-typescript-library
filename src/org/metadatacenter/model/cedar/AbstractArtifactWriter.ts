import { CedarAbstractArtifact } from './CedarAbstractArtifact';
import { JsonNode, JsonNodeClass } from './util/types/JsonNode';
import { JsonSchema } from './constants/JsonSchema';
import { JSONAtomicWriter } from '../../io/writer/JSONAtomicWriter';
import { BiboStatus } from './beans/BiboStatus';
import { PavVersion } from './beans/PavVersion';
import { CedarField } from './field/CedarField';
import { CedarModel } from './CedarModel';

export abstract class AbstractArtifactWriter {
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
