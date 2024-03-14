import { JSONFieldWriterInternal } from '../../../../../io/writer/JSONFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { JsonNode, JsonNodeClass } from '../../../types/basic-types/JsonNode';
import { CedarField } from '../../CedarField';
import { CedarModel } from '../../../constants/CedarModel';
import { JavascriptType } from '../../../types/beans/JavascriptType';

export class JSONFieldWriterAttributeValue extends JSONFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNodeForJSON(_propertiesObject: JsonNode): void {
    // Properties node must not be present for attribute-value field
  }

  override expandRequiredNodeForJSON(_requiredObject: JsonNode): void {
    // Required node must not be present for attribute-value field
  }

  protected expandTypeNodeForJSON(typeNode: JsonNode, _field: CedarField): void {
    typeNode[CedarModel.type] = this.atomicWriter.write(JavascriptType.STRING);
  }

  protected buildValueConstraintsObject(_field: CedarField): JsonNode {
    return JsonNodeClass.getEmpty();
  }
}
