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
import { TemplateElement } from '../../../model/cedar/element/TemplateElement';
import { AbstractArtifact } from '../../../model/cedar/AbstractArtifact';
import { AbstractInstanceArtifact } from '../../../model/cedar/AbstractInstanceArtifact';

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

  protected macroSchemaNameAndDescription(artifact: AbstractArtifact): JsonNode {
    return {
      [JsonSchema.schemaName]: artifact.schema_name,
      [JsonSchema.schemaDescription]: artifact.schema_description,
    } as JsonNode;
  }

  protected macroProvenance(artifact: AbstractArtifact, atomicWriter: JsonAtomicWriter): JsonNode {
    return {
      [JsonSchema.pavCreatedOn]: atomicWriter.write(artifact.pav_createdOn),
      [JsonSchema.pavCreatedBy]: atomicWriter.write(artifact.pav_createdBy),
      [JsonSchema.pavLastUpdatedOn]: atomicWriter.write(artifact.pav_lastUpdatedOn),
      [JsonSchema.oslcModifiedBy]: atomicWriter.write(artifact.oslc_modifiedBy),
    } as JsonNode;
  }

  protected macroStatusAndVersion(artifact: AbstractSchemaArtifact, atomicWriter: JsonAtomicWriter): JsonNode {
    const svObject: JsonNode = JsonNode.getEmpty();
    if (artifact.pav_version !== PavVersion.NULL) {
      svObject[JsonSchema.pavVersion] = atomicWriter.write(artifact.pav_version);
    }
    if (artifact.bibo_status !== BiboStatus.NULL) {
      svObject[JsonSchema.biboStatus] = atomicWriter.write(artifact.bibo_status);
    }
    return svObject;
  }

  protected macroSkos(artifact: TemplateField | TemplateElement): JsonNode {
    const skosObject: JsonNode = JsonNode.getEmpty();
    if (artifact.skos_prefLabel !== null) {
      skosObject[CedarModel.skosPrefLabel] = artifact.skos_prefLabel;
    }
    if (artifact.skos_altLabel !== null && artifact.skos_altLabel.length > 0) {
      skosObject[CedarModel.skosAltLabel] = artifact.skos_altLabel;
    }
    return skosObject;
  }

  protected macroDerivedFrom(artifact: AbstractArtifact): JsonNode {
    const derivedFrom: JsonNode = JsonNode.getEmpty();
    if (artifact.pav_derivedFrom !== CedarArtifactId.NULL) {
      derivedFrom[JsonSchema.pavDerivedFrom] = this.atomicWriter.write(artifact.pav_derivedFrom);
    }
    return derivedFrom;
  }

  protected macroIsBasedOn(artifact: AbstractInstanceArtifact): JsonNode {
    const isBasedOn: JsonNode = JsonNode.getEmpty();
    if (artifact.schema_isBasedOn !== CedarArtifactId.NULL) {
      isBasedOn[JsonSchema.schemaIsBasedOn] = this.atomicWriter.write(artifact.schema_isBasedOn);
    }
    return isBasedOn;
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

  protected macroAnnotations(artifact: AbstractArtifact): JsonNode {
    return this.annotationsWriter.write(artifact.annotations);
  }
}
