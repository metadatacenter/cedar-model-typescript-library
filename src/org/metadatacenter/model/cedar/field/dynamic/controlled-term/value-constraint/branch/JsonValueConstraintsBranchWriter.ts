import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { JsonWriterBehavior } from '../../../../../../../behavior/JsonWriterBehavior';
import { AbstractJsonControlledTermValueConstraintWriter } from '../AbstractJsonControlledTermValueConstraintWriter';
import { ControlledTermBranch } from './ControlledTermBranch';
import { CedarJsonWriters } from '../../../../../../../io/writer/json/CedarJsonWriters';

export class JsonValueConstraintsBranchWriter extends AbstractJsonControlledTermValueConstraintWriter {
  public constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  public getAsJsonString(branch: ControlledTermBranch, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(branch), null, indent);
  }

  override getAsJsonNode(branch: ControlledTermBranch): JsonNode {
    const ret = JsonNode.getEmpty();
    ret[CedarModel.ValueConstraints.source] = branch.source;
    ret[CedarModel.ValueConstraints.acronym] = branch.acronym;
    ret[CedarModel.ValueConstraints.name] = branch.name;
    ret[CedarModel.ValueConstraints.uri] = this.atomicWriter.write(branch.uri);
    ret[CedarModel.ValueConstraints.maxDepth] = branch.maxDepth;
    return ret;
  }
}
