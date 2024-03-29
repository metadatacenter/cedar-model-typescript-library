import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../../../io/writer/CedarWriters';
import { ControlledTermValueSet } from './ControlledTermValueSet';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../AbstractYAMLControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';
import { YamlValues } from '../../../../../constants/YamlValues';

export class YAMLValueConstraintsValueSetWriter extends AbstractYAMLControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(valueSet: ControlledTermValueSet): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    ret[YamlKeys.type] = YamlValues.Controlled.valueSet;
    ret[YamlKeys.Controlled.acronym] = valueSet.vsCollection;
    ret[YamlKeys.Controlled.valueSetName] = valueSet.name;
    ret[YamlKeys.Controlled.iri] = this.atomicWriter.write(valueSet.uri);
    ret[YamlKeys.Controlled.numTerms] = valueSet.numTerms;
    return ret;
  }
}
