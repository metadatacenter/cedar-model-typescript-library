import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { ControlledTermAction } from './ControlledTermAction';
import { AbstractYamlControlledTermValueConstraintWriter } from '../AbstractYamlControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';
import { YamlWriterBehavior } from '../../../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../../../io/writer/yaml/CedarYamlWriters';

export class YamlValueConstraintsActionWriter extends AbstractYamlControlledTermValueConstraintWriter {
  public constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
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
    ret[YamlKeys.type] = this.atomicWriter.write(action.type);
    return ret;
  }
}
