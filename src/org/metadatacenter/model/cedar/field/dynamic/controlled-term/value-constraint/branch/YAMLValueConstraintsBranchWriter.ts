import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../../../io/writer/CedarWriters';
import { ControlledTermBranch } from './ControlledTermBranch';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../AbstractYAMLControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';

export class YAMLValueConstraintsBranchWriter extends AbstractYAMLControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(branch: ControlledTermBranch): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    // TODO: extract constant
    ret[YamlKeys.valueType] = 'branch';
    ret[CedarModel.ValueConstraints.source] = branch.source;
    ret[CedarModel.ValueConstraints.acronym] = branch.acronym;
    ret[CedarModel.ValueConstraints.name] = branch.name;
    ret[CedarModel.ValueConstraints.uri] = this.atomicWriter.write(branch.uri);
    ret[CedarModel.ValueConstraints.maxDepth] = branch.maxDepth;
    return ret;
  }
}
