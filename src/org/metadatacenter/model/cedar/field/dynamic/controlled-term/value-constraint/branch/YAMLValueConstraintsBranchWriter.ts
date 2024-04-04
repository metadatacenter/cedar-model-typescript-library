import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { ControlledTermBranch } from './ControlledTermBranch';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../AbstractYAMLControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';
import { YamlValues } from '../../../../../constants/YamlValues';
import { YAMLWriterBehavior } from '../../../../../../../behavior/YAMLWriterBehavior';
import { CedarYAMLWriters } from '../../../../../../../io/writer/yaml/CedarYAMLWriters';

export class YAMLValueConstraintsBranchWriter extends AbstractYAMLControlledTermValueConstraintWriter {
  public constructor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters) {
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
