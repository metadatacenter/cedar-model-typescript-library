import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';
import { JsonNode, JsonNodeClass } from '../../model/cedar/types/basic-types/JsonNode';
import { TemplateField } from '../../model/cedar/field/TemplateField';
import { CedarModel } from '../../model/cedar/constants/CedarModel';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { JSONTemplateFieldContentDynamic } from '../../model/cedar/util/serialization/JSONTemplateFieldContentDynamic';
import { JavascriptType } from '../../model/cedar/types/wrapped-types/JavascriptType';
import { TemplateProperty } from '../../model/cedar/constants/TemplateProperty';
import { ArtifactSchema } from '../../model/cedar/types/wrapped-types/ArtifactSchema';
import { CedarWriters } from './CedarWriters';
import { JSONAbstractArtifactWriter } from './JSONAbstractArtifactWriter';
import { AdditionalProperties } from '../../model/cedar/types/wrapped-types/AdditionalProperties';
import { ChildDeploymentInfo } from '../../model/cedar/deployment/ChildDeploymentInfo';
import { CheckboxField } from '../../model/cedar/field/dynamic/checkbox/CheckboxField';
import { ListField } from '../../model/cedar/field/dynamic/list/ListField';
import { RadioField } from '../../model/cedar/field/dynamic/radio/RadioField';
import { ChoiceOptionEntity } from '../../model/cedar/field/ChoiceOptionEntity';

export abstract class JSONTemplateFieldWriterInternal extends JSONAbstractArtifactWriter {
  protected constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  protected expandPropertiesNodeForJSON(propertiesObject: JsonNode): void {
    propertiesObject[JsonSchema.properties] = JSONTemplateFieldContentDynamic.PROPERTIES_VERBATIM_LITERAL;
    if (!this.behavior.usePropertiesAtLanguage()) {
      propertiesObject[JsonSchema.properties] = JSONTemplateFieldContentDynamic.PROPERTIES_VERBATIM_LITERAL_NO_AT_LANGUAGE;
    }
  }

  protected expandRequiredNodeForJSON(requiredObject: JsonNode): void {
    requiredObject[JsonSchema.required] = [JsonSchema.atValue];
  }

  protected expandUINodeForJSON(uiNode: JsonNode, _field: TemplateField, childInfo: ChildDeploymentInfo): void {
    if (childInfo.hidden) {
      uiNode[CedarModel.Ui.hidden] = childInfo.hidden;
    }
  }

  protected buildUIObject(field: TemplateField, childInfo: ChildDeploymentInfo): JsonNode {
    const uiNode: JsonNode = {
      [CedarModel.inputType]: this.atomicWriter.write(field.cedarFieldType.getUiInputType()),
    };
    const uiObject: JsonNode = {
      [CedarModel.ui]: uiNode,
    };
    this.expandUINodeForJSON(uiNode, field, childInfo);
    return uiObject;
  }

  protected expandTypeNodeForJSON(_typeNode: JsonNode, _field: TemplateField): void {}

  protected expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: TemplateField, childInfo: ChildDeploymentInfo): void {
    vcNode[CedarModel.requiredValue] = childInfo.requiredValue;
  }

  protected buildValueConstraintsObject(field: TemplateField, childInfo: ChildDeploymentInfo): JsonNode {
    const vcNode: JsonNode = JsonNodeClass.getEmpty();
    const vcObject = {
      [CedarModel.valueConstraints]: vcNode,
    };
    this.expandValueConstraintsNodeForJSON(vcNode, field, childInfo);
    return vcObject;
  }

  protected expandLiterals(field: CheckboxField | ListField | RadioField, vcNode: JsonNode) {
    const literals: Array<JsonNode> = JsonNodeClass.getEmptyList();
    field.valueConstraints.literals.forEach((option: ChoiceOptionEntity) => {
      const literal = JsonNodeClass.getEmpty();
      literal[CedarModel.label] = option.label;
      if (option.selectedByDefault) {
        literal[CedarModel.selectedByDefault] = option.selectedByDefault;
      }
      literals.push(literal);
    });
    vcNode[CedarModel.literals] = literals;
  }

  public getAsJsonString(field: TemplateField, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(field, ChildDeploymentInfo.empty()), null, indent);
  }

  public getAsJsonNode(field: TemplateField): JsonNode;
  public getAsJsonNode(field: TemplateField, childInfo: ChildDeploymentInfo): JsonNode;
  public getAsJsonNode(field: TemplateField, childInfo: ChildDeploymentInfo = ChildDeploymentInfo.empty()): JsonNode {
    // Build properties wrapper, based on type
    const propertiesObject: JsonNode = JsonNodeClass.getEmpty();
    this.expandPropertiesNodeForJSON(propertiesObject);

    // Build required wrapper
    const requiredObject: JsonNode = JsonNodeClass.getEmpty();
    this.expandRequiredNodeForJSON(requiredObject);

    // Build ui wrapper
    const uiObject: JsonNode = this.buildUIObject(field, childInfo);

    // Build value constraints wrapper
    const vcObject: JsonNode = this.buildValueConstraintsObject(field, childInfo);

    // Build type wrapper
    const typeNode: JsonNode = {
      [CedarModel.type]: this.atomicWriter.write(JavascriptType.OBJECT),
    };
    this.expandTypeNodeForJSON(typeNode, field);

    // build the final object
    return {
      [JsonSchema.atId]: this.atomicWriter.write(field.at_id),
      [JsonSchema.atType]: this.atomicWriter.write(field.cedarArtifactType),
      [JsonSchema.atContext]: JSONTemplateFieldContentDynamic.CONTEXT_VERBATIM,
      ...typeNode,
      [TemplateProperty.title]: field.title,
      [TemplateProperty.description]: field.description,
      ...uiObject,
      ...vcObject,
      ...propertiesObject,
      ...requiredObject,
      ...this.macroSchemaNameAndDescription(field),
      ...this.macroProvenance(field, this.atomicWriter),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(field.schema_schemaVersion),
      [TemplateProperty.additionalProperties]: this.atomicWriter.write(AdditionalProperties.FALSE),
      ...this.macroStatusAndVersion(field, this.atomicWriter),
      [CedarModel.schema]: this.atomicWriter.write(ArtifactSchema.CURRENT),
      ...this.macroSkos(field),
      ...this.macroDerivedFrom(field),
    };
  }
}
