import { AbstractArtifactWriter } from '../AbstractArtifactWriter';
import { YamlAtomicWriter } from './YamlAtomicWriter';
import { AbstractSchemaArtifact } from '../../../model/cedar/AbstractSchemaArtifact';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { BiboStatus } from '../../../model/cedar/types/wrapped-types/BiboStatus';
import { PavVersion } from '../../../model/cedar/types/wrapped-types/PavVersion';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { YamlAnnotationsWriter } from './YamlAnnotationsWriter';
import { CedarUser } from '../../../model/cedar/types/cedar-types/CedarUser';
import { IsoDate } from '../../../model/cedar/types/wrapped-types/IsoDate';
import { TemplateElement } from '../../../model/cedar/element/TemplateElement';
import { YamlArtifactType } from '../../../model/cedar/types/wrapped-types/YamlArtifactType';
import { Template } from '../../../model/cedar/template/Template';
import { YamlWriterBehavior } from '../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from './CedarYamlWriters';
import { ControlledTermFieldImpl } from '../../../model/cedar/field/dynamic/controlled-term/ControlledTermFieldImpl';
import { TextFieldImpl } from '../../../model/cedar/field/dynamic/textfield/TextFieldImpl';
import { Language } from '../../../model/cedar/types/wrapped-types/Language';
import { SchemaVersion } from '../../../model/cedar/types/wrapped-types/SchemaVersion';
import { AbstractArtifact } from '../../../model/cedar/AbstractArtifact';
import { AbstractInstanceArtifact } from '../../../model/cedar/AbstractInstanceArtifact';
import { TemplateInstance } from '../../../model/cedar/template-instance/TemplateInstance';

export abstract class YamlAbstractArtifactWriter extends AbstractArtifactWriter {
  protected behavior: YamlWriterBehavior;
  protected writers: CedarYamlWriters;

  protected atomicWriter: YamlAtomicWriter;
  protected annotationsWriter: YamlAnnotationsWriter;

  protected constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super();
    this.behavior = behavior;
    this.writers = writers;
    this.atomicWriter = writers.getAtomicWriter();
    this.annotationsWriter = writers.getAnnotationsWriter();
  }

  protected macroNameAndDescription(artifact: AbstractArtifact): JsonNode {
    const node: JsonNode = JsonNode.getEmpty();
    if (artifact instanceof AbstractSchemaArtifact) {
      if (artifact.language !== Language.NULL) {
        node[YamlKeys.language] = this.atomicWriter.write(artifact.language);
      }
    }
    node[YamlKeys.name] = artifact.schema_name;
    if (artifact.schema_description !== null && artifact.schema_description !== '') {
      node[YamlKeys.description] = artifact.schema_description;
    }
    return node;
  }

  protected macroStatusAndVersion(artifact: AbstractSchemaArtifact, isCompact: boolean): JsonNode {
    const svObject: JsonNode = JsonNode.getEmpty();
    if (!isCompact) {
      if (artifact.bibo_status !== BiboStatus.NULL) {
        svObject[YamlKeys.status] = this.atomicWriter.write(artifact.bibo_status);
      }
      if (artifact.pav_version !== PavVersion.NULL) {
        svObject[YamlKeys.version] = this.atomicWriter.write(artifact.pav_version);
      }
      svObject[YamlKeys.modelVersion] = this.atomicWriter.write(SchemaVersion.CURRENT);
    }
    return svObject;
  }

  /** An element carries a preferred label and alternatives as a field does, and the JSON writer has
   *  always written both for either. */
  protected macroSkos(artifact: TemplateField | TemplateElement): JsonNode {
    const skosObject: JsonNode = JsonNode.getEmpty();
    if (artifact.skos_prefLabel !== null) {
      skosObject[YamlKeys.prefLabel] = artifact.skos_prefLabel;
    }
    if (artifact.skos_altLabel !== null && artifact.skos_altLabel.length > 0) {
      skosObject[YamlKeys.altLabels] = artifact.skos_altLabel;
    }
    return skosObject;
  }

  protected macroValueRecommendation(field: TemplateField): JsonNode {
    const ret: JsonNode = JsonNode.getEmpty();
    if (field instanceof ControlledTermFieldImpl || field instanceof TextFieldImpl) {
      if (field.valueRecommendationEnabled) {
        ret[YamlKeys.valueRecommendation] = field.valueRecommendationEnabled;
      }
    }
    return ret;
  }

  protected macroProvenance(artifact: AbstractArtifact, isCompact: boolean): JsonNode {
    const prov = JsonNode.getEmpty();
    if (!isCompact) {
      if (artifact.pav_createdOn !== IsoDate.NULL) {
        prov[YamlKeys.createdOn] = this.atomicWriter.write(artifact.pav_createdOn);
      }
      if (artifact.pav_createdBy !== CedarUser.NULL) {
        prov[YamlKeys.createdBy] = this.atomicWriter.write(artifact.pav_createdBy);
      }
      if (artifact.pav_lastUpdatedOn !== IsoDate.NULL) {
        prov[YamlKeys.modifiedOn] = this.atomicWriter.write(artifact.pav_lastUpdatedOn);
      }
      if (artifact.oslc_modifiedBy !== CedarUser.NULL) {
        prov[YamlKeys.modifiedBy] = this.atomicWriter.write(artifact.oslc_modifiedBy);
      }
    }
    return prov;
  }

  protected macroSchemaIdentifier(artifact: AbstractSchemaArtifact): JsonNode {
    const schemaIdentifier: JsonNode = JsonNode.getEmpty();
    if (artifact.schema_identifier !== null) {
      schemaIdentifier[YamlKeys.identifier] = artifact.schema_identifier;
    }
    return schemaIdentifier;
  }

  protected macroType(artifact: AbstractArtifact): JsonNode {
    const typeAndId: JsonNode = JsonNode.getEmpty();
    typeAndId[YamlKeys.type] = this.getYamlType(artifact);
    return typeAndId;
  }

  /**
   * The identifier is written in both forms. What the compact form drops is the content the system
   * records about an artifact — its provenance, version and status — and an artifact's identity is
   * not among them: dropping it leaves a document that reads back as a different, anonymous
   * artifact. The Java library keeps it too, and the servers recognize a compact body by finding an
   * id with none of the system-recorded keys beside it.
   */
  protected macroId(artifact: AbstractArtifact): JsonNode {
    const typeAndId: JsonNode = JsonNode.getEmpty();
    if (artifact.at_id !== CedarArtifactId.NULL) {
      typeAndId[YamlKeys.id] = this.atomicWriter.write(artifact.at_id);
    }
    return typeAndId;
  }

  protected macroDerivedFrom(artifact: AbstractArtifact, isCompact: boolean): JsonNode {
    const derivedFrom: JsonNode = JsonNode.getEmpty();
    if (!isCompact) {
      if (artifact.pav_derivedFrom !== CedarArtifactId.NULL) {
        derivedFrom[YamlKeys.derivedFrom] = this.atomicWriter.write(artifact.pav_derivedFrom);
      }
    }
    return derivedFrom;
  }

  protected macroIsBasedOn(artifact: AbstractInstanceArtifact): JsonNode {
    const isBasedOn: JsonNode = JsonNode.getEmpty();
    if (artifact.schema_isBasedOn !== CedarArtifactId.NULL) {
      isBasedOn[YamlKeys.isBasedOn] = this.atomicWriter.write(artifact.schema_isBasedOn);
    }
    return isBasedOn;
  }

  protected macroPreviousVersion(artifact: AbstractSchemaArtifact, isCompact: boolean): JsonNode {
    const previousVersion: JsonNode = JsonNode.getEmpty();
    if (!isCompact) {
      if (artifact.pav_previousVersion !== CedarArtifactId.NULL) {
        previousVersion[YamlKeys.previousVersion] = this.atomicWriter.write(artifact.pav_previousVersion);
      }
    }
    return previousVersion;
  }

  protected macroAnnotations(artifact: AbstractArtifact): JsonNode {
    return this.annotationsWriter.write(artifact.annotations);
  }

  protected getYamlType(artifact: AbstractArtifact) {
    if (artifact instanceof Template) {
      return YamlArtifactType.TEMPLATE.getValue();
    } else if (artifact instanceof TemplateElement) {
      return YamlArtifactType.ELEMENT.getValue();
    } else if (artifact instanceof TemplateField) {
      return artifact.cedarFieldType.getYamlType().getValue();
    } else if (artifact instanceof TemplateInstance) {
      return YamlArtifactType.TEMPLATE_INSTANCE.getValue();
    }
    return undefined;
  }
}
