import { JsonWriterBehavior } from '../../../behavior/JsonWriterBehavior';
import { SchemaVersion } from '../../../model/cedar/types/wrapped-types/SchemaVersion';
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
import { AbstractFieldChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractFieldChildDeploymentInfo';
import { AbstractChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractChildDeploymentInfo';
import { ControlledTermFieldImpl } from '../../../model/cedar/field/dynamic/controlled-term/ControlledTermFieldImpl';
import { TextFieldImpl } from '../../../model/cedar/field/dynamic/textfield/TextFieldImpl';
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

  protected expandUINode(uiNode: JsonNode, field: TemplateField, childInfo: AbstractChildDeploymentInfo): void {
    if (childInfo instanceof AbstractDynamicChildDeploymentInfo) {
      if (childInfo.hidden) {
        uiNode[CedarModel.Ui.hidden] = childInfo.hidden;
      }
      // A line placement and a value recommendation are a dynamic field's, and only its own `_ui`
      // has room for either.
      if (childInfo instanceof AbstractFieldChildDeploymentInfo) {
        if (childInfo.continuePreviousLine) {
          uiNode[CedarModel.Ui.continuePreviousLine] = childInfo.continuePreviousLine;
        }
        if (childInfo.valueRecommendationEnabled && field.supportsValueRecommendation()) {
          uiNode[CedarModel.Ui.valueRecommendationEnabled] = childInfo.valueRecommendationEnabled;
        }
      }
    }
    // A field written on its own has no container to state the setting, and a standalone write
    // passes an empty deployment info, so it comes from the field. The JSON writer read only the
    // deployment info and so dropped it, while the YAML writer has always read the field directly —
    // which is how the two serializations came to disagree. A child is unaffected: reading a
    // container leaves the child's own flag off and states the setting in the deployment info the
    // branch above reads, and this never overrides what that branch decided. The guard is the YAML
    // writer's, so the two stay symmetric.
    if (
      uiNode[CedarModel.Ui.valueRecommendationEnabled] === undefined &&
      (field instanceof ControlledTermFieldImpl || field instanceof TextFieldImpl) &&
      field.valueRecommendationEnabled
    ) {
      uiNode[CedarModel.Ui.valueRecommendationEnabled] = true;
    }
    // As above, for the field's own `hidden`. A container states it for a child in the deployment
    // info the branch above reads, and never sets the field's own flag, so this cannot change what
    // that branch decided.
    if (uiNode[CedarModel.Ui.hidden] === undefined && field.hidden) {
      uiNode[CedarModel.Ui.hidden] = true;
    }
    if (uiNode[CedarModel.Ui.continuePreviousLine] === undefined && field.continuePreviousLine) {
      uiNode[CedarModel.Ui.continuePreviousLine] = true;
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
    // A field written on its own carries the requirement itself: there is no container to state
    // it, and the deployment info a standalone write passes says nothing, so the branch above
    // reported every such field as optional however it was stored. A child is unaffected, since
    // reading a container leaves the field's own flag off.
    if (!vcNode[CedarModel.requiredValue] && field.requiredValue) {
      vcNode[CedarModel.requiredValue] = true;
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
      if (option.statesSelectedByDefault || option.selectedByDefault) {
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
      ...this.macroPreviousVersion(field),
      ...this.macroDerivedFrom(field),
      // The model version names the model the rendering conforms to, so it is the writer's to state
      // and not the document's to carry forward. Preserving a stored one republished an assertion
      // about a model this library no longer emits; the YAML writer has always stamped it.
      [JsonSchema.schemaVersion]: this.atomicWriter.write(SchemaVersion.CURRENT),
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
