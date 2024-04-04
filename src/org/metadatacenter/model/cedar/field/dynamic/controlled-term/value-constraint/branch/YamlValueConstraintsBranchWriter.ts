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
    ret[YamlKeys.Controlled.ontologyName] = branch.source;
    ret[YamlKeys.Controlled.acronym] = branch.acronym;
    ret[YamlKeys.Controlled.termLabel] = branch.name;
    ret[YamlKeys.Controlled.iri] = this.atomicWriter.write(branch.uri);
    ret[YamlKeys.Controlled.maxDepth] = branch.maxDepth;
    return ret;
  }
}
