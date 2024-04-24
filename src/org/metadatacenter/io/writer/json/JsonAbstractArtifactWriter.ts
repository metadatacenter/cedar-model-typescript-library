import { AbstractArtifactWriter } from '../AbstractArtifactWriter';
import { JsonWriterBehavior } from '../../../behavior/JsonWriterBehavior';
import { JsonAtomicWriter } from './JsonAtomicWriter';
import { JsonAnnotationsWriter } from './JsonAnnotationsWriter';
import { AbstractSchemaArtifact } from '../../../model/cedar/AbstractSchemaArtifact';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { BiboStatus } from '../../../model/cedar/types/wrapped-types/BiboStatus';
import { PavVersion } from '../../../model/cedar/types/wrapped-types/PavVersion';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { ValueConstraints } from '../../../model/cedar/field/ValueConstraints';
import { CedarJsonWriters } from './CedarJsonWriters';

export abstract class JsonAbstractArtifactWriter extends AbstractArtifactWriter {
  protected behavior: JsonWriterBehavior;
  protected writers: CedarJsonWriters;
  protected atomicWriter: JsonAtomicWriter;
  protected annotationsWriter: JsonAnnotationsWriter;

  protected constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super();
    this.behavior = behavior;
    this.writers = writers;
    this.atomicWriter = writers.getAtomicWriter();
    this.annotationsWriter = writers.getAnnotationsWriter();
  }

  public getBehavior(): JsonWriterBehavior {
    return this.behavior;
  }

  public abstract getAsJsonString(artifact: AbstractSchemaArtifact | ValueConstraints): string;

  protected macroSchemaNameAndDescription(artifact: AbstractSchemaArtifact): JsonNode {
    return {
      [JsonSchema.schemaName]: artifact.schema_name,
      [JsonSchema.schemaDescription]: artifact.schema_description,
    } as JsonNode;
  }

  protected macroProvenance(artifact: AbstractSchemaArtifact, atomicWriter: JsonAtomicWriter): JsonNode {
    return {
      [JsonSchema.pavCreatedOn]: atomicWriter.write(artifact.pav_createdOn),
      [JsonSchema.pavCreatedBy]: atomicWriter.write(artifact.pav_createdBy),
      [JsonSchema.pavLastUpdatedOn]: atomicWriter.write(artifact.pav_lastUpdatedOn),
      [JsonSchema.oslcModifiedBy]: atomicWriter.write(artifact.oslc_modifiedBy),
    } as JsonNode;
  }

  protected macroStatusAndVersion(artifact: AbstractSchemaArtifact, atomicWriter: JsonAtomicWriter): JsonNode {
    const svObject: JsonNode = JsonNode.getEmpty();
    if (artifact.bibo_status !== BiboStatus.NULL) {
      svObject[JsonSchema.biboStatus] = atomicWriter.write(artifact.bibo_status);
    }
    if (artifact.pav_version !== PavVersion.NULL) {
      svObject[JsonSchema.pavVersion] = atomicWriter.write(artifact.pav_version);
    }
    return svObject;
  }

  protected macroSkos(field: TemplateField): JsonNode {
    const skosObject: JsonNode = JsonNode.getEmpty();
    if (field.skos_altLabel !== null && field.skos_altLabel.length > 0) {
      skosObject[CedarModel.skosAltLabel] = field.skos_altLabel;
    }
    if (field.skos_prefLabel !== null) {
      skosObject[CedarModel.skosPrefLabel] = field.skos_prefLabel;
    }
    return skosObject;
  }

  protected macroDerivedFrom(artifact: AbstractSchemaArtifact): JsonNode {
    const derivedFrom: JsonNode = JsonNode.getEmpty();
    if (artifact.pav_derivedFrom !== CedarArtifactId.NULL) {
      derivedFrom[JsonSchema.pavDerivedFrom] = this.atomicWriter.write(artifact.pav_derivedFrom);
    }
    return derivedFrom;
  }

  protected macroPreviousVersion(artifact: AbstractSchemaArtifact): JsonNode {
    const previousVersion: JsonNode = JsonNode.getEmpty();
    if (artifact.pav_previousVersion !== CedarArtifactId.NULL) {
      previousVersion[JsonSchema.pavPreviousVersion] = this.atomicWriter.write(artifact.pav_previousVersion);
    }
    return previousVersion;
  }

  protected macroSchemaIdentifier(artifact: AbstractSchemaArtifact): JsonNode {
    const schemaIdentifier: JsonNode = JsonNode.getEmpty();
    if (artifact.schema_identifier !== null) {
      schemaIdentifier[JsonSchema.schemaIdentifier] = artifact.schema_identifier;
    }
    return schemaIdentifier;
  }

  protected macroAnnotations(artifact: AbstractSchemaArtifact): JsonNode {
    return this.annotationsWriter.write(artifact.annotations);
  }
}
