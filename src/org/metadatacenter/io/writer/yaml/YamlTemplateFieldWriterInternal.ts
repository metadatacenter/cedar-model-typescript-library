import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { CheckboxField } from '../../../model/cedar/field/dynamic/checkbox/CheckboxField';
import { ListField } from '../../../model/cedar/field/dynamic/list/ListField';
import { RadioField } from '../../../model/cedar/field/dynamic/radio/RadioField';
import { ChoiceOptionEntity } from '../../../model/cedar/field/ChoiceOptionEntity';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YamlAbstractArtifactWriter } from './YamlAbstractArtifactWriter';
import { SimpleYamlSerializer } from './SimpleYamlSerializer';
import { YamlWriterBehavior } from '../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from './CedarYamlWriters';
import { AbstractChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractChildDeploymentInfo';

export abstract class YamlTemplateFieldWriterInternal extends YamlAbstractArtifactWriter {
  protected constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  public getAsYamlString(field: TemplateField, isCompact: boolean = false): string {
    return SimpleYamlSerializer.serialize(this.getYamlAsJsonNode(field, ChildDeploymentInfo.empty(), isCompact));
  }

  public getYamlAsJsonNode(field: TemplateField): JsonNode;

  public getYamlAsJsonNode(field: TemplateField, childInfo: AbstractChildDeploymentInfo): JsonNode;

  public getYamlAsJsonNode(field: TemplateField, childInfo: AbstractChildDeploymentInfo, isCompact: boolean): JsonNode;

  public getYamlAsJsonNode(
    field: TemplateField,
    childInfo: AbstractChildDeploymentInfo = ChildDeploymentInfo.empty(),
    isCompact: boolean = false,
  ): JsonNode {
    // Build ui wrapper
    const uiObject: JsonNode = this.buildUIObject(field, childInfo);

    // Build value constraints wrapper
    const vcObject: JsonNode = this.buildValueConstraintsObject(field, childInfo);

    // build the final object
    return {
      ...this.macroType(field),
      ...this.macroNameAndDescription(field),
      ...this.macroSchemaIdentifier(field),
      ...this.macroId(field, isCompact),
      ...this.macroStatusAndVersion(field, isCompact),
      ...this.macroSkos(field),
      ...uiObject,
      ...vcObject,
      ...this.macroValueRecommendation(field),
      ...this.macroPreviousVersion(field, isCompact),
      ...this.macroDerivedFrom(field, isCompact),
      ...this.macroProvenance(field, isCompact),
      ...this.macroAnnotations(field),
    };
  }

  protected expandUINodeForYAML(_field: TemplateField): JsonNode {
    return JsonNode.getEmpty();
  }

  protected expandValueConstraintsNodeForYAML(_vcNode: JsonNode, _field: TemplateField, _childInfo: AbstractChildDeploymentInfo): void {}

  protected buildValueConstraintsObject(field: TemplateField, childInfo: AbstractChildDeploymentInfo): JsonNode {
    const vcNode: JsonNode = JsonNode.getEmpty();
    this.expandValueConstraintsNodeForYAML(vcNode, field, childInfo);
    return vcNode;
  }

  protected expandLiterals(field: CheckboxField | ListField | RadioField, vcNode: JsonNode) {
    const literals: Array<JsonNode> = JsonNode.getEmptyList();
    field.valueConstraints.literals.forEach((option: ChoiceOptionEntity) => {
      const literal = JsonNode.getEmpty();
      literal[CedarModel.label] = option.label;
      if (option.selectedByDefault) {
        literal[YamlKeys.selected] = option.selectedByDefault;
      }
      literals.push(literal);
    });
    if (literals.length > 0) {
      vcNode[YamlKeys.values] = literals;
    }
  }

  protected buildUIObject(field: TemplateField, _childInfo: AbstractChildDeploymentInfo): JsonNode {
    return this.expandUINodeForYAML(field);
  }
}
