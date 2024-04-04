import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { ControlledTermAction } from './ControlledTermAction';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../AbstractYAMLControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';
import { YAMLWriterBehavior } from '../../../../../../../behavior/YAMLWriterBehavior';
import { CedarYAMLWriters } from '../../../../../../../io/writer/yaml/CedarYAMLWriters';

export class YAMLValueConstraintsActionWriter extends AbstractYAMLControlledTermValueConstraintWriter {
  public constructor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(action: ControlledTermAction): JsonNode {
    const ret = JsonNode.getEmpty();
    ret[YamlKeys.action] = action.action;
    if (action.to !== null) {
      ret[YamlKeys.Controlled.to] = action.to;
    }
    ret[YamlKeys.Controlled.termIri] = this.atomicWriter.write(action.termUri);
    ret[YamlKeys.Controlled.sourceIri] = this.atomicWriter.write(action.sourceUri);
    ret[YamlKeys.Controlled.sourceAcronym] = action.source;
    return ret;
  }
}
