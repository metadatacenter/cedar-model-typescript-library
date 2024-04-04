import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { ControlledTermValueSet } from './ControlledTermValueSet';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../AbstractYAMLControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';
import { YamlValues } from '../../../../../constants/YamlValues';
import { YAMLWriterBehavior } from '../../../../../../../behavior/YAMLWriterBehavior';
import { CedarYAMLWriters } from '../../../../../../../io/writer/yaml/CedarYAMLWriters';

export class YAMLValueConstraintsValueSetWriter extends AbstractYAMLControlledTermValueConstraintWriter {
  public constructor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters) {
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
