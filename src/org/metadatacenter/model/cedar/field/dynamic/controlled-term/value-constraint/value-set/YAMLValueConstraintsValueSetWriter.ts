import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../../../io/writer/CedarWriters';
import { ControlledTermValueSet } from './ControlledTermValueSet';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../AbstractYAMLControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';

export class YAMLValueConstraintsValueSetWriter extends AbstractYAMLControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(valueSet: ControlledTermValueSet): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    // TODO: extract constant
    ret[YamlKeys.valueType] = 'valueSet';
    ret[CedarModel.ValueConstraints.vsCollection] = valueSet.vsCollection;
    ret[CedarModel.ValueConstraints.name] = valueSet.name;
    ret[CedarModel.ValueConstraints.uri] = this.atomicWriter.write(valueSet.uri);
    ret[CedarModel.ValueConstraints.numTerms] = valueSet.numTerms;
    return ret;
  }
}
