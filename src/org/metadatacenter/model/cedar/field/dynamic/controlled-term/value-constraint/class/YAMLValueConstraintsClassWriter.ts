import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { ControlledTermClass } from './ControlledTermClass';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../AbstractYAMLControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';
import { YamlValues } from '../../../../../constants/YamlValues';
import { YAMLWriterBehavior } from '../../../../../../../behavior/YAMLWriterBehavior';
import { CedarYAMLWriters } from '../../../../../../../io/writer/yaml/CedarYAMLWriters';

export class YAMLValueConstraintsClassWriter extends AbstractYAMLControlledTermValueConstraintWriter {
  public constructor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(clazz: ControlledTermClass): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    ret[YamlKeys.type] = YamlValues.Controlled.class;
    ret[YamlKeys.Controlled.label] = clazz.label;
    ret[YamlKeys.Controlled.acronym] = clazz.source;
    ret[YamlKeys.Controlled.termType] = this.atomicWriter.write(clazz.type);
    ret[YamlKeys.Controlled.termLabel] = clazz.prefLabel;
    ret[YamlKeys.Controlled.iri] = this.atomicWriter.write(clazz.uri);
    return ret;
  }
}
