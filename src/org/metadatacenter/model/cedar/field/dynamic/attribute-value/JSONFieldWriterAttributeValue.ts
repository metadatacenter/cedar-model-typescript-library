import { JSONTemplateFieldWriterInternal } from '../../../../../io/writer/json/JSONTemplateFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { JsonNode, JsonNodeClass } from '../../../types/basic-types/JsonNode';
import { TemplateField } from '../../TemplateField';
import { CedarModel } from '../../../constants/CedarModel';
import { JavascriptType } from '../../../types/wrapped-types/JavascriptType';

export class JSONFieldWriterAttributeValue extends JSONTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNodeForJSON(_propertiesObject: JsonNode): void {
    // Properties node must not be present for attribute-value field
  }

  override expandRequiredNodeForJSON(_requiredObject: JsonNode): void {
    // Required node must not be present for attribute-value field
  }

  protected expandTypeNodeForJSON(typeNode: JsonNode, _field: TemplateField): void {
    typeNode[CedarModel.type] = this.atomicWriter.write(JavascriptType.STRING);
  }

  protected buildValueConstraintsObject(_field: TemplateField): JsonNode {
    return JsonNodeClass.getEmpty();
  }
}
