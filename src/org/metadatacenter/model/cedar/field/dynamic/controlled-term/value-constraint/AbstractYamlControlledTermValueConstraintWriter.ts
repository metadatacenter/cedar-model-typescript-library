import { JsonNode } from '../../../../types/basic-types/JsonNode';
import { ControlledTermAbstractValueConstraint } from './ControlledTermAbstractValueConstraint';
import { YamlValueConstraintsWriter } from '../../../YamlValueConstraintsWriter';

export abstract class AbstractYamlControlledTermValueConstraintWriter extends YamlValueConstraintsWriter {
  abstract getAsJsonNode(ontology: ControlledTermAbstractValueConstraint): JsonNode;
}
