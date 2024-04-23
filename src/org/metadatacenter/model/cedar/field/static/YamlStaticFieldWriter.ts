import { StaticImageField } from './image/StaticImageField';
import { JsonNode } from '../../types/basic-types/JsonNode';
import { TemplateField } from '../TemplateField';
import { YamlTemplateFieldWriterInternal } from '../../../../io/writer/yaml/YamlTemplateFieldWriterInternal';
import { YamlWriterBehavior } from '../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../io/writer/yaml/CedarYamlWriters';

export class YamlStaticFieldWriter extends YamlTemplateFieldWriterInternal {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  protected expandUINodeForYAML(_field: TemplateField): JsonNode {
    return super.expandUINodeForYAML(_field);
  }

  protected buildUIObject(field: TemplateField): JsonNode {
    return this.expandUINodeForYAML(field);
  }

  override getYamlAsJsonNode(field: StaticImageField): JsonNode {
    // Build ui wrapper
    //const uiObject: JsonNode = this.buildUIObject(field);
    return {
      ...this.macroType(field),
      ...this.macroNameAndDescription(field),
      ...this.macroSchemaIdentifier(field),
      ...this.macroId(field),
      ...this.macroStatusAndVersion(field),
      ...this.macroSkos(field),
      ...this.expandUINodeForYAML(field),
      ...this.macroProvenance(field),
      ...this.macroDerivedFrom(field),
      ...this.macroPreviousVersion(field),
      ...this.macroAnnotations(field),
    };
  }
}
