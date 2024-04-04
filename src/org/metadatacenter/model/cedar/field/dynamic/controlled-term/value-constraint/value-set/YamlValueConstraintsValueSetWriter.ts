import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { ControlledTermValueSet } from './ControlledTermValueSet';
import { AbstractYamlControlledTermValueConstraintWriter } from '../AbstractYamlControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';
import { YamlValues } from '../../../../../constants/YamlValues';
import { YamlWriterBehavior } from '../../../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../../../io/writer/yaml/CedarYamlWriters';

export class YamlValueConstraintsValueSetWriter extends AbstractYamlControlledTermValueConstraintWriter {
  public constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(valueSet: ControlledTermValueSet): JsonNode {
    const ret = JsonNode.getEmpty();
    ret[YamlKeys.type] = YamlValues.Controlled.valueSet;
    ret[YamlKeys.Controlled.acronym] = valueSet.vsCollection;
    ret[YamlKeys.Controlled.valueSetName] = valueSet.name;
    ret[YamlKeys.Controlled.iri] = this.atomicWriter.write(valueSet.uri);
    ret[YamlKeys.Controlled.numTerms] = valueSet.numTerms;
    return ret;
  }
}
