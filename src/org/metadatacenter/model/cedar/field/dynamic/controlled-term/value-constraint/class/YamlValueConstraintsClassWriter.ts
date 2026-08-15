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
    this.writeSourceSystem(ret, clazz);
    ret[YamlKeys.Controlled.sourceAcronym] = clazz.source;
    this.writeSourceIri(ret, clazz);
    ret[YamlKeys.Controlled.termIri] = this.atomicWriter.write(clazz.uri);
    ret[YamlKeys.Controlled.termType] = this.atomicWriter.write(clazz.type);
    ret[YamlKeys.Controlled.termLabel] = clazz.prefLabel;
    // The author-facing display label is not written: this dialect has one label per class, and a
    // class read back takes its preferred label as the display label too.
    this.writeVersion(ret, clazz);
    return ret;
  }
}
