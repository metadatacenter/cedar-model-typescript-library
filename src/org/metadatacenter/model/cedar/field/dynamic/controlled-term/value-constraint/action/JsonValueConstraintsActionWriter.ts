import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { JsonWriterBehavior } from '../../../../../../../behavior/JsonWriterBehavior';
import { AbstractJsonControlledTermValueConstraintWriter } from '../AbstractJsonControlledTermValueConstraintWriter';
import { ControlledTermAction } from './ControlledTermAction';
import { CedarJsonWriters } from '../../../../../../../io/writer/json/CedarJsonWriters';

export class JsonValueConstraintsActionWriter extends AbstractJsonControlledTermValueConstraintWriter {
  public constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  public getAsJsonString(action: ControlledTermAction, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(action), null, indent);
  }

  override getAsJsonNode(action: ControlledTermAction): JsonNode {
    const ret = JsonNode.getEmpty();
    if (action.to !== null) {
      ret[CedarModel.ValueConstraints.to] = action.to;
    }
    ret[CedarModel.ValueConstraints.action] = action.action;
    ret[CedarModel.ValueConstraints.termUri] = this.atomicWriter.write(action.termUri);
    ret[CedarModel.ValueConstraints.sourceUri] = this.atomicWriter.write(action.sourceUri);
    ret[CedarModel.ValueConstraints.source] = action.source;
    ret[CedarModel.ValueConstraints.type] = this.atomicWriter.write(action.type);
    return ret;
  }
}
