import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { CedarField } from '../../model/cedar/field/CedarField';

export interface JSONFieldWriter {
  getAsJsonNode(field: CedarField): JsonNode;
}
