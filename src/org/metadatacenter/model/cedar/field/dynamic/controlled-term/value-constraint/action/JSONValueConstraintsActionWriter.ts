import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { AbstractJSONControlledTermValueConstraintWriter } from '../AbstractJSONControlledTermValueConstraintWriter';
import { ControlledTermAction } from './ControlledTermAction';
import { CedarJSONWriters } from '../../../../../../../io/writer/json/CedarJSONWriters';

export class JSONValueConstraintsActionWriter extends AbstractJSONControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarJSONWriters) {
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
    ret[CedarModel.ValueConstraints.type] = action.type;
    return ret;
  }
}
