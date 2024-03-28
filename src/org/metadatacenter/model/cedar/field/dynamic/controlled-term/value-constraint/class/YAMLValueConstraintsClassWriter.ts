import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../../../io/writer/CedarWriters';
import { ControlledTermClass } from './ControlledTermClass';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../AbstractYAMLControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';

export class YAMLValueConstraintsClassWriter extends AbstractYAMLControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(clazz: ControlledTermClass): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    // TODO: extract constant
    ret[YamlKeys.valueType] = 'class';
    ret[CedarModel.ValueConstraints.label] = clazz.label;
    ret[CedarModel.ValueConstraints.source] = clazz.source;
    ret[CedarModel.ValueConstraints.type] = clazz.type;
    ret[CedarModel.ValueConstraints.prefLabel] = clazz.prefLabel;
    ret[CedarModel.ValueConstraints.uri] = this.atomicWriter.write(clazz.uri);
    return ret;
  }
}
