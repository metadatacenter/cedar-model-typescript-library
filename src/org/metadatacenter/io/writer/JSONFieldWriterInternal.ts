import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';
import { JsonNode, JsonNodeClass } from '../../model/cedar/types/basic-types/JsonNode';
import { CedarField } from '../../model/cedar/field/CedarField';
import { CedarModel } from '../../model/cedar/constants/CedarModel';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { CedarJSONTemplateFieldContentDynamic } from '../../model/cedar/util/serialization/CedarJSONTemplateFieldContentDynamic';
import { JavascriptType } from '../../model/cedar/types/beans/JavascriptType';
import { TemplateProperty } from '../../model/cedar/constants/TemplateProperty';
import { CedarSchema } from '../../model/cedar/types/beans/CedarSchema';
import { CedarWriters } from './CedarWriters';
import { JSONAbstractArtifactWriter } from './JSONAbstractArtifactWriter';
import { AdditionalProperties } from '../../model/cedar/types/beans/AdditionalProperties';
import { CedarContainerChildInfo } from '../../model/cedar/types/beans/CedarContainerChildInfo';

export abstract class JSONFieldWriterInternal extends JSONAbstractArtifactWriter {
  protected constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  protected expandPropertiesNodeForJSON(propertiesObject: JsonNode): void {
    propertiesObject[JsonSchema.properties] = CedarJSONTemplateFieldContentDynamic.PROPERTIES_VERBATIM_LITERAL;
  }

  protected expandRequiredNodeForJSON(requiredObject: JsonNode): void {
    requiredObject[JsonSchema.required] = [JsonSchema.atValue];
  }

  protected expandUINodeForJSON(uiNode: JsonNode, _field: CedarField, childInfo: CedarContainerChildInfo): void {
    if (childInfo.hidden) {
      uiNode[CedarModel.Ui.hidden] = childInfo.hidden;
    }
  }

  protected buildUIObject(field: CedarField, childInfo: CedarContainerChildInfo): JsonNode {
    const uiNode: JsonNode = {
      [CedarModel.inputType]: this.atomicWriter.write(field.cedarFieldType.getUiInputType()),
    };
    const uiObject: JsonNode = {
      [CedarModel.ui]: uiNode,
    };
    this.expandUINodeForJSON(uiNode, field, childInfo);
    return uiObject;
  }

  protected expandTypeNodeForJSON(_typeNode: JsonNode, _field: CedarField): void {}

  protected expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: CedarField, childInfo: CedarContainerChildInfo): void {
    vcNode[CedarModel.requiredValue] = childInfo.requiredValue;
  }

  protected buildValueConstraintsObject(field: CedarField, childInfo: CedarContainerChildInfo): JsonNode {
    const vcNode: JsonNode = JsonNodeClass.getEmpty();
    const vcObject = {
      [CedarModel.valueConstraints]: vcNode,
    };
    this.expandValueConstraintsNodeForJSON(vcNode, field, childInfo);
    return vcObject;
  }

  public getAsJsonString(field: CedarField, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(field, CedarContainerChildInfo.empty()), null, indent);
  }

  public getAsJsonNode(field: CedarField): JsonNode;
  public getAsJsonNode(field: CedarField, childInfo: CedarContainerChildInfo): JsonNode;
  public getAsJsonNode(field: CedarField, childInfo: CedarContainerChildInfo = CedarContainerChildInfo.empty()): JsonNode {
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
      [JsonSchema.atContext]: CedarJSONTemplateFieldContentDynamic.CONTEXT_VERBATIM,
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
      [CedarModel.schema]: this.atomicWriter.write(CedarSchema.CURRENT),
      ...this.macroSkos(field),
    };
  }
}
