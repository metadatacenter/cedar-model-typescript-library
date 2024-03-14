import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { TemplateField } from '../../model/cedar/field/TemplateField';

export interface JSONFieldWriter {
  getAsJsonNode(field: TemplateField): JsonNode;
}
