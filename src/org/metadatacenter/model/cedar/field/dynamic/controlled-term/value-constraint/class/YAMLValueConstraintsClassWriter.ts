import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../../../io/writer/CedarWriters';
import { ControlledTermClass } from './ControlledTermClass';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../AbstractYAMLControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';
import { YamlValues } from '../../../../../constants/YamlValues';

export class YAMLValueConstraintsClassWriter extends AbstractYAMLControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(clazz: ControlledTermClass): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    ret[YamlKeys.type] = YamlValues.Controlled.class;
    ret[YamlKeys.Controlled.label] = clazz.label;
    ret[YamlKeys.Controlled.acronym] = clazz.source;
    ret[YamlKeys.Controlled.termType] = clazz.type;
    ret[YamlKeys.Controlled.termLabel] = clazz.prefLabel;
    ret[YamlKeys.Controlled.iri] = this.atomicWriter.write(clazz.uri);
    return ret;
  }
}
