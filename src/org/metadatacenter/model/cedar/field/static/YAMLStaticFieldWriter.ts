import { JSONWriterBehavior } from '../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../io/writer/CedarWriters';
import { StaticImageField } from './image/StaticImageField';
import { JsonNode, JsonNodeClass } from '../../types/basic-types/JsonNode';
import { TemplateField } from '../TemplateField';
import { YAMLTemplateFieldWriterInternal } from '../../../../io/writer/yaml/YAMLTemplateFieldWriterInternal';

export class YAMLStaticFieldWriter extends YAMLTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
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
