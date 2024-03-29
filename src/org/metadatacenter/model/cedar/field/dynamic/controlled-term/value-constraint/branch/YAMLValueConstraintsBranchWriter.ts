import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../../../io/writer/CedarWriters';
import { ControlledTermBranch } from './ControlledTermBranch';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../AbstractYAMLControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';
import { YamlValues } from '../../../../../constants/YamlValues';

export class YAMLValueConstraintsBranchWriter extends AbstractYAMLControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(branch: ControlledTermBranch): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    ret[YamlKeys.type] = YamlValues.Controlled.branch;
    ret[YamlKeys.Controlled.ontologyName] = branch.source;
    ret[YamlKeys.Controlled.acronym] = branch.acronym;
    ret[YamlKeys.Controlled.termLabel] = branch.name;
    ret[YamlKeys.Controlled.iri] = this.atomicWriter.write(branch.uri);
    ret[YamlKeys.Controlled.maxDepth] = branch.maxDepth;
    return ret;
  }
}
