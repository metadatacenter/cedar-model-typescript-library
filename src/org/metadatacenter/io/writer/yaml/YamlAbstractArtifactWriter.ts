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

  protected macroNameAndDescription(artifact: AbstractSchemaArtifact): JsonNode {
    const node: JsonNode = JsonNode.getEmpty();
    if (artifact.language !== Language.NULL) {
      node[YamlKeys.language] = this.atomicWriter.write(artifact.language);
    }
    node[YamlKeys.name] = artifact.schema_name;
    if (artifact.schema_description !== null && artifact.schema_description !== '') {
      node[YamlKeys.description] = artifact.schema_description;
    }
    return node;
  }

  // protected macroNameAndDescriptionTemplate(artifact: AbstractSchemaArtifact): JsonNode {
  //   const node: JsonNode = JsonNode.getEmpty();
  //   node[YamlKeys.name] = artifact.schema_name;
  //   if (artifact.schema_description !== null && artifact.schema_description !== '') {
  //     node[YamlKeys.description] = artifact.schema_description;
  //   }
  //   return node;
  // }

  protected macroStatusAndVersion(artifact: AbstractSchemaArtifact): JsonNode {
    const svObject: JsonNode = JsonNode.getEmpty();
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
    const skosObject: JsonNode = JsonNode.getEmpty();
    if (field.skos_prefLabel !== null) {
      skosObject[YamlKeys.prefLabel] = field.skos_prefLabel;
    }
    if (field.skos_altLabel !== null && field.skos_altLabel.length > 0) {
      skosObject[YamlKeys.altLabels] = field.skos_altLabel;
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

  protected macroProvenance(artifact: AbstractSchemaArtifact): JsonNode {
    const prov = JsonNode.getEmpty();
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
    return prov;
  }

  protected macroSchemaIdentifier(artifact: AbstractSchemaArtifact): JsonNode {
    const schemaIdentifier: JsonNode = JsonNode.getEmpty();
    if (artifact.schema_identifier !== null) {
      schemaIdentifier[YamlKeys.identifier] = artifact.schema_identifier;
    }
    return schemaIdentifier;
  }

  protected macroType(artifact: AbstractSchemaArtifact): JsonNode {
    const typeAndId: JsonNode = JsonNode.getEmpty();
    typeAndId[YamlKeys.type] = this.getYamlType(artifact);
    return typeAndId;
  }

  protected macroId(artifact: AbstractSchemaArtifact): JsonNode {
    const typeAndId: JsonNode = JsonNode.getEmpty();
    if (artifact.at_id !== CedarArtifactId.NULL) {
      typeAndId[YamlKeys.id] = this.atomicWriter.write(artifact.at_id);
    }
    return typeAndId;
  }

  protected macroDerivedFrom(artifact: AbstractSchemaArtifact): JsonNode {
    const derivedFrom: JsonNode = JsonNode.getEmpty();
    if (artifact.pav_derivedFrom !== CedarArtifactId.NULL) {
      derivedFrom[YamlKeys.derivedFrom] = this.atomicWriter.write(artifact.pav_derivedFrom);
    }
    return derivedFrom;
  }

  protected macroPreviousVersion(artifact: AbstractSchemaArtifact): JsonNode {
    const previousVersion: JsonNode = JsonNode.getEmpty();
    if (artifact.pav_previousVersion !== CedarArtifactId.NULL) {
      previousVersion[YamlKeys.previousVersion] = this.atomicWriter.write(artifact.pav_previousVersion);
    }
    return previousVersion;
  }

  protected macroAnnotations(artifact: AbstractSchemaArtifact): JsonNode {
    return this.annotationsWriter.write(artifact.annotations);
  }

  protected getYamlType(artifact: AbstractSchemaArtifact) {
    if (artifact instanceof Template) {
      return YamlArtifactType.TEMPLATE.getValue();
    } else if (artifact instanceof TemplateElement) {
      return YamlArtifactType.ELEMENT.getValue();
    } else if (artifact instanceof TemplateField) {
      return artifact.cedarFieldType.getYamlType().getValue();
    }
    return undefined;
  }
}
