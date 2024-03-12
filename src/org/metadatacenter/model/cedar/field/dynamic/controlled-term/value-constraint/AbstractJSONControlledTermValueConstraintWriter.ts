import { JsonNode } from '../../../../types/basic-types/JsonNode';
import { ControlledTermAbstractValueConstraint } from './ControlledTermAbstractValueConstraint';
import { JSONValueConstraintsWriter } from '../../../JSONValueConstraintsWriter';

export abstract class AbstractJSONControlledTermValueConstraintWriter extends JSONValueConstraintsWriter {
  abstract getAsJsonNode(ontology: ControlledTermAbstractValueConstraint): JsonNode;
}
