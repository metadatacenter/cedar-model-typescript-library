import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../../../io/writer/CedarWriters';
import { ControlledTermAction } from './ControlledTermAction';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../AbstractYAMLControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';

export class YAMLValueConstraintsActionWriter extends AbstractYAMLControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(action: ControlledTermAction): JsonNode {
    const ret = JsonNodeClass.getEmpty();
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
