import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../../../io/writer/CedarWriters';
import { AbstractJSONControlledTermValueConstraintWriter } from '../AbstractJSONControlledTermValueConstraintWriter';
import { ControlledTermBranch } from './ControlledTermBranch';

export class JSONValueConstraintsBranchWriter extends AbstractJSONControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(branch: ControlledTermBranch): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    ret[CedarModel.ValueConstraints.source] = branch.source;
    ret[CedarModel.ValueConstraints.acronym] = branch.acronym;
    ret[CedarModel.ValueConstraints.name] = branch.name;
    ret[CedarModel.ValueConstraints.uri] = this.atomicWriter.write(branch.uri);
    ret[CedarModel.ValueConstraints.maxDepth] = branch.maxDepth;
    return ret;
  }
}
