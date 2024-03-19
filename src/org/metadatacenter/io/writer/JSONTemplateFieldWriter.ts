import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { TemplateField } from '../../model/cedar/field/TemplateField';

export interface JSONTemplateFieldWriter {
  getAsJsonNode(field: TemplateField): JsonNode;
}
