import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { ControlledTermBranch } from './ControlledTermBranch';
import { AbstractYamlControlledTermValueConstraintWriter } from '../AbstractYamlControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';
import { YamlValues } from '../../../../../constants/YamlValues';
import { YamlWriterBehavior } from '../../../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../../../io/writer/yaml/CedarYamlWriters';

export class YamlValueConstraintsBranchWriter extends AbstractYamlControlledTermValueConstraintWriter {
  public constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(branch: ControlledTermBranch): JsonNode {
    const ret = JsonNode.getEmpty();
    ret[YamlKeys.type] = YamlValues.Controlled.branch;
    this.writeSourceSystem(ret, branch);
    ret[YamlKeys.Controlled.sourceAcronym] = branch.acronym;
    ret[YamlKeys.Controlled.sourceName] = branch.source;
    this.writeSourceIri(ret, branch);
    ret[YamlKeys.Controlled.termBaseIri] = this.atomicWriter.write(branch.uri);
    ret[YamlKeys.Controlled.termBaseLabel] = branch.name;
    ret[YamlKeys.Controlled.termMaxDepth] = branch.maxDepth;
    this.writeVersion(ret, branch);
    return ret;
  }
}
