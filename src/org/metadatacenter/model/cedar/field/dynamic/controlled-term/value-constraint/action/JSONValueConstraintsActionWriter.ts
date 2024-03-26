import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../../../io/writer/CedarWriters';
import { AbstractJSONControlledTermValueConstraintWriter } from '../AbstractJSONControlledTermValueConstraintWriter';
import { ControlledTermAction } from './ControlledTermAction';

export class JSONValueConstraintsActionWriter extends AbstractJSONControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(action: ControlledTermAction): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    if (action.to !== null) {
      ret[CedarModel.ValueConstraints.to] = action.to;
    }
    ret[CedarModel.ValueConstraints.action] = action.action;
    ret[CedarModel.ValueConstraints.termUri] = this.atomicWriter.write(action.termUri);
    ret[CedarModel.ValueConstraints.sourceUri] = this.atomicWriter.write(action.sourceUri);
    ret[CedarModel.ValueConstraints.source] = action.source;
    ret[CedarModel.ValueConstraints.type] = action.type;
    return ret;
  }
}
