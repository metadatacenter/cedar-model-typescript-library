import { StaticImageField } from './image/StaticImageField';
import { JsonNode } from '../../types/basic-types/JsonNode';
import { TemplateField } from '../TemplateField';
import { YAMLTemplateFieldWriterInternal } from '../../../../io/writer/yaml/YAMLTemplateFieldWriterInternal';
import { YAMLWriterBehavior } from '../../../../behavior/YAMLWriterBehavior';
import { CedarYAMLWriters } from '../../../../io/writer/yaml/CedarYAMLWriters';

export class YAMLStaticFieldWriter extends YAMLTemplateFieldWriterInternal {
  constructor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters) {
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
      ...this.macroTypeAndId(field),
      ...this.macroSchemaIdentifier(field),
      ...this.macroNameAndDescription(field),
      ...this.macroStatusAndVersion(field),
      ...this.macroSkos(field),
      ...this.expandUINodeForYAML(field),
      ...this.macroProvenance(field),
      ...this.macroDerivedFrom(field),
      ...this.macroAnnotations(field),
    };
  }
}
