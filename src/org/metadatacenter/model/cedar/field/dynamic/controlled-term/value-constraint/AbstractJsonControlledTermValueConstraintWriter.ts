import { JsonNode } from '../../../../types/basic-types/JsonNode';
import { ControlledTermAbstractValueConstraint } from './ControlledTermAbstractValueConstraint';
import { JsonValueConstraintsWriter } from '../../../JsonValueConstraintsWriter';

export abstract class AbstractJsonControlledTermValueConstraintWriter extends JsonValueConstraintsWriter {
  abstract getAsJsonNode(ontology: ControlledTermAbstractValueConstraint): JsonNode;
}
