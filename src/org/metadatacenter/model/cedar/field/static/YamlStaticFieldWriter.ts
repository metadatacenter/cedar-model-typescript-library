import { JsonNode } from '../../types/basic-types/JsonNode';
import { TemplateField } from '../TemplateField';
import { YamlTemplateFieldWriterInternal } from '../../../../io/writer/yaml/YamlTemplateFieldWriterInternal';
import { YamlWriterBehavior } from '../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../io/writer/yaml/CedarYamlWriters';
import { AbstractChildDeploymentInfo } from '../../deployment/AbstractChildDeploymentInfo';
import { ChildDeploymentInfo } from '../../deployment/ChildDeploymentInfo';

export class YamlStaticFieldWriter extends YamlTemplateFieldWriterInternal {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  protected expandUINodeForYAML(_field: TemplateField): JsonNode {
    return super.expandUINodeForYAML(_field);
  }

  /** The display size of a static field that has one; empty for the static fields that do not. */
  protected expandSizeForYAML(_field: TemplateField): JsonNode {
    return JsonNode.getEmpty();
  }

  protected buildUIObject(field: TemplateField): JsonNode {
    return this.expandUINodeForYAML(field);
  }

  override getYamlAsJsonNode(field: TemplateField): JsonNode;
  override getYamlAsJsonNode(field: TemplateField, childInfo: AbstractChildDeploymentInfo): JsonNode;
  override getYamlAsJsonNode(field: TemplateField, childInfo: AbstractChildDeploymentInfo, isCompact: boolean): JsonNode;

  override getYamlAsJsonNode(
    field: TemplateField,
    _childInfo: AbstractChildDeploymentInfo = ChildDeploymentInfo.empty(),
    isCompact: boolean = false,
  ): JsonNode {
    // Build ui wrapper
    //const uiObject: JsonNode = this.buildUIObject(field);
    return {
      ...this.macroType(field),
      ...this.macroNameAndDescription(field),
      ...this.macroSchemaIdentifier(field),
      ...this.macroId(field),
      ...this.macroStatusAndVersion(field, isCompact),
      ...this.macroSkos(field),
      ...this.expandUINodeForYAML(field),
      // A child's size is written by the parent, into that child's `configuration`.
      ...(_childInfo.hasParent() ? JsonNode.getEmpty() : this.expandSizeForYAML(field)),
      ...this.macroProvenance(field, isCompact),
      ...this.macroDerivedFrom(field, isCompact),
      ...this.macroPreviousVersion(field, isCompact),
      ...this.macroAnnotations(field),
    };
  }
}
