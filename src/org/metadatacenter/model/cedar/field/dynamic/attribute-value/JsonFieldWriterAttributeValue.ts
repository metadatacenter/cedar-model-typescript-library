import { JsonTemplateFieldWriterInternal } from '../../../../../io/writer/json/JsonTemplateFieldWriterInternal';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { JsonNode } from '../../../types/basic-types/JsonNode';
import { TemplateField } from '../../TemplateField';
import { CedarModel } from '../../../constants/CedarModel';
import { JavascriptType } from '../../../types/wrapped-types/JavascriptType';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';

export class JsonFieldWriterAttributeValue extends JsonTemplateFieldWriterInternal {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNode(_propertiesObject: JsonNode): void {
    // Properties node must not be present for attribute-value field
  }

  override expandRequiredNode(_requiredObject: JsonNode): void {
    // Required node must not be present for attribute-value field
  }

  protected expandTypeNode(typeNode: JsonNode, _field: TemplateField): void {
    typeNode[CedarModel.type] = this.atomicWriter.write(JavascriptType.STRING);
  }

  protected buildValueConstraintsObject(_field: TemplateField): JsonNode {
    return JsonNode.getEmpty();
  }
}
