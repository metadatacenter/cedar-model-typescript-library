import { JsonWriterBehavior } from '../../../behavior/JsonWriterBehavior';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { JsonTemplateFieldContentDynamic } from '../../../model/cedar/util/serialization/JsonTemplateFieldContentDynamic';
import { JavascriptType } from '../../../model/cedar/types/wrapped-types/JavascriptType';
import { TemplateProperty } from '../../../model/cedar/constants/TemplateProperty';
import { ArtifactSchema } from '../../../model/cedar/types/wrapped-types/ArtifactSchema';
import { JsonAbstractArtifactWriter } from './JsonAbstractArtifactWriter';
import { AdditionalProperties } from '../../../model/cedar/types/wrapped-types/AdditionalProperties';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { CheckboxField } from '../../../model/cedar/field/dynamic/checkbox/CheckboxField';
import { ListField } from '../../../model/cedar/field/dynamic/list/ListField';
import { RadioField } from '../../../model/cedar/field/dynamic/radio/RadioField';
import { ChoiceOptionEntity } from '../../../model/cedar/field/ChoiceOptionEntity';
import { CedarJsonWriters } from './CedarJsonWriters';
import { AbstractDynamicChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractDynamicChildDeploymentInfo';
import { AbstractChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractChildDeploymentInfo';
import { Language } from '../../../model/cedar/types/wrapped-types/Language';
import { ReaderUtil } from '../../reader/ReaderUtil';

export abstract class JsonTemplateFieldWriterInternal extends JsonAbstractArtifactWriter {
  protected constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  protected expandPropertiesNode(propertiesObject: JsonNode): void {
    propertiesObject[JsonSchema.properties] = JsonTemplateFieldContentDynamic.PROPERTIES_VERBATIM_LITERAL;
    if (!this.behavior.usePropertiesAtLanguage()) {
      propertiesObject[JsonSchema.properties] = JsonTemplateFieldContentDynamic.PROPERTIES_VERBATIM_LITERAL_NO_AT_LANGUAGE;
    }
  }

  protected expandRequiredNode(requiredObject: JsonNode): void {
    requiredObject[JsonSchema.required] = [JsonSchema.atValue];
  }

  protected expandUINode(uiNode: JsonNode, _field: TemplateField, childInfo: AbstractChildDeploymentInfo): void {
    if (childInfo instanceof AbstractDynamicChildDeploymentInfo) {
      if (childInfo.hidden) {
        uiNode[CedarModel.Ui.hidden] = childInfo.hidden;
      }
      if (childInfo.continuePreviousLine) {
        uiNode[CedarModel.Ui.continuePreviousLine] = childInfo.continuePreviousLine;
      }
      if (childInfo.valueRecommendationEnabled) {
        uiNode[CedarModel.valueRecommendationEnabled] = childInfo.valueRecommendationEnabled;
      }
    }
  }

  protected buildUIObject(field: TemplateField, childInfo: AbstractChildDeploymentInfo): JsonNode {
    const uiNode: JsonNode = {
      [CedarModel.inputType]: this.atomicWriter.write(field.cedarFieldType.getUiInputType()),
    };
    const uiObject: JsonNode = {
      [CedarModel.ui]: uiNode,
    };
    this.expandUINode(uiNode, field, childInfo);
    return uiObject;
  }

  protected expandTypeNode(_typeNode: JsonNode, _field: TemplateField): void {}

  protected expandValueConstraintsNode(vcNode: JsonNode, field: TemplateField, childInfo: AbstractChildDeploymentInfo): void {
    if (childInfo instanceof AbstractDynamicChildDeploymentInfo) {
      vcNode[CedarModel.requiredValue] = childInfo.requiredValue;
    }
    if (childInfo instanceof AbstractDynamicChildDeploymentInfo) {
      if (childInfo.recommendedValue) {
        vcNode[CedarModel.ValueConstraints.recommendedValue] = childInfo.recommendedValue;
      }
    }
  }

  protected buildValueConstraintsObject(field: TemplateField, childInfo: AbstractChildDeploymentInfo): JsonNode {
    const vcNode: JsonNode = JsonNode.getEmpty();
    const vcObject = {
      [CedarModel.valueConstraints]: vcNode,
    };
    this.expandValueConstraintsNode(vcNode, field, childInfo);
    return vcObject;
  }

  protected expandLiterals(field: CheckboxField | ListField | RadioField, vcNode: JsonNode) {
    const literals: Array<JsonNode> = JsonNode.getEmptyList();
    field.valueConstraints.literals.forEach((option: ChoiceOptionEntity) => {
      const literal = JsonNode.getEmpty();
      literal[CedarModel.label] = option.label;
      if (option.selectedByDefault) {
        literal[CedarModel.selectedByDefault] = option.selectedByDefault;
      }
      literals.push(literal);
    });
    if (literals.length > 0) {
      vcNode[CedarModel.literals] = literals;
    }
  }

  public getAsJsonString(field: TemplateField, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(field, ChildDeploymentInfo.empty()), null, indent);
  }

  public getAsJsonNode(field: TemplateField): JsonNode;
  public getAsJsonNode(field: TemplateField, childInfo: AbstractChildDeploymentInfo): JsonNode;
  public getAsJsonNode(field: TemplateField, childInfo: AbstractChildDeploymentInfo = ChildDeploymentInfo.empty()): JsonNode {
    // Build properties wrapper, based on type
    const propertiesObject: JsonNode = JsonNode.getEmpty();
    this.expandPropertiesNode(propertiesObject);

    // Build required wrapper
    const requiredObject: JsonNode = JsonNode.getEmpty();
    this.expandRequiredNode(requiredObject);

    // Build ui wrapper
    const uiObject: JsonNode = this.buildUIObject(field, childInfo);

    // Build value constraints wrapper
    const vcObject: JsonNode = this.buildValueConstraintsObject(field, childInfo);

    // Build type wrapper
    const typeNode: JsonNode = {
      [CedarModel.type]: this.atomicWriter.write(JavascriptType.OBJECT),
    };
    this.expandTypeNode(typeNode, field);

    // build the final object
    return {
      [JsonSchema.atId]: this.atomicWriter.write(field.at_id),
      [JsonSchema.atType]: this.atomicWriter.write(field.cedarArtifactType),
      [JsonSchema.atContext]: this.macroContext(field),
      ...typeNode,
      [TemplateProperty.title]: field.title,
      [TemplateProperty.description]: field.description,
      ...uiObject,
      ...vcObject,
      ...propertiesObject,
      ...requiredObject,
      ...this.macroAnnotations(field),
      ...this.macroSchemaNameAndDescription(field),
      ...this.macroProvenance(field, this.atomicWriter),
      ...this.macroSkos(field),
      ...this.macroStatusAndVersion(field, this.atomicWriter),
      ...this.macroDerivedFrom(field),
      ...this.macroPreviousVersion(field),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(field.schema_schemaVersion),
      [TemplateProperty.additionalProperties]: this.atomicWriter.write(AdditionalProperties.FALSE),
      ...this.macroSchemaIdentifier(field),
      [CedarModel.schema]: this.atomicWriter.write(ArtifactSchema.CURRENT),
    };
  }

  protected macroContext(field: TemplateField) {
    const context = ReaderUtil.deepClone(JsonTemplateFieldContentDynamic.CONTEXT_VERBATIM);
    // @language
    if (field.language !== Language.NULL) {
      context[JsonSchema.atLanguage] = this.atomicWriter.write(field.language);
    }
    return context;
  }
}
