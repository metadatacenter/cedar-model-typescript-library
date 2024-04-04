import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { ControlledTermClass } from './ControlledTermClass';
import { AbstractYamlControlledTermValueConstraintWriter } from '../AbstractYamlControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';
import { YamlValues } from '../../../../../constants/YamlValues';
import { YamlWriterBehavior } from '../../../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../../../io/writer/yaml/CedarYamlWriters';

export class YamlValueConstraintsClassWriter extends AbstractYamlControlledTermValueConstraintWriter {
  public constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(clazz: ControlledTermClass): JsonNode {
    const ret = JsonNode.getEmpty();
    ret[YamlKeys.type] = YamlValues.Controlled.class;
    ret[YamlKeys.Controlled.label] = clazz.label;
    ret[YamlKeys.Controlled.acronym] = clazz.source;
    ret[YamlKeys.Controlled.termType] = this.atomicWriter.write(clazz.type);
    ret[YamlKeys.Controlled.termLabel] = clazz.prefLabel;
    ret[YamlKeys.Controlled.iri] = this.atomicWriter.write(clazz.uri);
    return ret;
  }
}
