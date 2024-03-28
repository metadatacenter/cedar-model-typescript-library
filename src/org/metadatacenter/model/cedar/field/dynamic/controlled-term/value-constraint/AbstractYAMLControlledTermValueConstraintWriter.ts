import { JsonNode } from '../../../../types/basic-types/JsonNode';
import { ControlledTermAbstractValueConstraint } from './ControlledTermAbstractValueConstraint';
import { YAMLValueConstraintsWriter } from '../../../YAMLValueConstraintsWriter';

export abstract class AbstractYAMLControlledTermValueConstraintWriter extends YAMLValueConstraintsWriter {
  abstract getAsJsonNode(ontology: ControlledTermAbstractValueConstraint): JsonNode;
}
