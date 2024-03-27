import { JSONWriterBehavior } from '../../../behavior/JSONWriterBehavior';
import { JsonNode, JsonNodeClass } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { CedarWriters } from '../CedarWriters';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { CheckboxField } from '../../../model/cedar/field/dynamic/checkbox/CheckboxField';
import { ListField } from '../../../model/cedar/field/dynamic/list/ListField';
import { RadioField } from '../../../model/cedar/field/dynamic/radio/RadioField';
import { ChoiceOptionEntity } from '../../../model/cedar/field/ChoiceOptionEntity';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YAMLAbstractArtifactWriter } from './YAMLAbstractArtifactWriter';
import { SimpleYamlSerializer } from './SimpleYamlSerializer';

export abstract class YAMLTemplateFieldWriterInternal extends YAMLAbstractArtifactWriter {
  protected constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  public getAsYamlString(field: TemplateField, indent: number = 2): string {
    return SimpleYamlSerializer.serialize(this.getYamlAsJsonNode(field, ChildDeploymentInfo.empty()), indent).trim();
  }

  public getYamlAsJsonNode(field: TemplateField): JsonNode;

  public getYamlAsJsonNode(field: TemplateField, childInfo: ChildDeploymentInfo): JsonNode;

  public getYamlAsJsonNode(field: TemplateField, childInfo: ChildDeploymentInfo = ChildDeploymentInfo.empty()): JsonNode {
    // Build ui wrapper
    const uiObject: JsonNode = this.buildUIObject(field, childInfo);

    // Build value constraints wrapper
    const vcObject: JsonNode = this.buildValueConstraintsObject(field, childInfo);

    // build the final object
    return {
      ...this.macroTypeAndId(field),
      ...this.macroSchemaIdentifier(field),
      ...this.macroNameAndDescription(field),
      ...this.macroStatusAndVersion(field),
      ...this.macroSkos(field),
      ...uiObject,
      ...vcObject,
      ...this.macroProvenance(field),
      ...this.macroDerivedFrom(field),
      ...this.macroAnnotations(field),
    };
  }

  protected expandUINodeForYAML(uiNode: JsonNode, _field: TemplateField, childInfo: ChildDeploymentInfo): void {
    if (childInfo.hidden) {
      uiNode[CedarModel.Ui.hidden] = childInfo.hidden;
    }
  }

  protected expandTypeNodeForYAML(_typeNode: JsonNode, _field: TemplateField): void {}

  protected expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: TemplateField, childInfo: ChildDeploymentInfo): void {
    if (childInfo.requiredValue) {
      vcNode[YamlKeys.required] = childInfo.requiredValue;
    }
  }

  protected buildValueConstraintsObject(field: TemplateField, childInfo: ChildDeploymentInfo): JsonNode {
    const vcNode: JsonNode = JsonNodeClass.getEmpty();
    this.expandValueConstraintsNodeForYAML(vcNode, field, childInfo);
    return vcNode;
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

  protected buildUIObject(field: TemplateField, childInfo: ChildDeploymentInfo): JsonNode {
    const uiNode: JsonNode = {
      [YamlKeys.inputType]: this.atomicWriter.write(field.cedarFieldType.getUiInputType()),
    };
    this.expandUINodeForYAML(uiNode, field, childInfo);
    return uiNode;
  }
}
