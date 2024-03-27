import { JSONWriterBehavior } from '../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../io/writer/CedarWriters';
import { StaticImageField } from './image/StaticImageField';
import { JsonNode } from '../../types/basic-types/JsonNode';
import { TemplateField } from '../TemplateField';
import { YAMLTemplateFieldWriterInternal } from '../../../../io/writer/yaml/YAMLTemplateFieldWriterInternal';
import { YamlKeys } from '../../constants/YamlKeys';

export class YAMLStaticFieldWriter extends YAMLTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  protected expandUINodeForYAML(_uiNode: JsonNode, _field: TemplateField): void {}

  protected buildUIObject(field: TemplateField): JsonNode {
    // TODO: YAML: In case of a static field, the inputType might be misleading
    const uiNode: JsonNode = {
      [YamlKeys.inputType]: this.atomicWriter.write(field.cedarFieldType.getUiInputType()),
    };
    this.expandUINodeForYAML(uiNode, field);
    return uiNode;
  }

  override getYamlAsJsonNode(field: StaticImageField): JsonNode {
    // Build ui wrapper
    const uiObject: JsonNode = this.buildUIObject(field);
    return {
      ...this.macroTypeAndId(field),
      ...this.macroSchemaIdentifier(field),
      ...this.macroNameAndDescription(field),
      ...this.macroStatusAndVersion(field),
      ...this.macroSkos(field),
      ...uiObject,
      ...this.macroProvenance(field),
      ...this.macroDerivedFrom(field),
      ...this.macroAnnotations(field),
    };
  }
}
