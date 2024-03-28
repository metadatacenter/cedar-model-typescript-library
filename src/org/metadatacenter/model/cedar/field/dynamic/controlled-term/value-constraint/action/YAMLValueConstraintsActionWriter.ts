import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../../../io/writer/CedarWriters';
import { ControlledTermAction } from './ControlledTermAction';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../AbstractYAMLControlledTermValueConstraintWriter';

export class YAMLValueConstraintsActionWriter extends AbstractYAMLControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(action: ControlledTermAction): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    ret[CedarModel.ValueConstraints.action] = action.action;
    if (action.to !== null) {
      ret[CedarModel.ValueConstraints.to] = action.to;
    }
    ret[CedarModel.ValueConstraints.termUri] = this.atomicWriter.write(action.termUri);
    ret[CedarModel.ValueConstraints.sourceUri] = this.atomicWriter.write(action.sourceUri);
    ret[CedarModel.ValueConstraints.source] = action.source;
    return ret;
  }
}
