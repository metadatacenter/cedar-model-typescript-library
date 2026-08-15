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
    this.writeSourceSystem(ret, valueSet);
    ret[YamlKeys.Controlled.sourceAcronym] = valueSet.vsCollection;
    this.writeSourceIri(ret, valueSet);
    ret[YamlKeys.Controlled.termBaseIri] = this.atomicWriter.write(valueSet.uri);
    ret[YamlKeys.Controlled.termBaseLabel] = valueSet.name;
    if (valueSet.numTerms !== null) {
      ret[YamlKeys.Controlled.termCount] = valueSet.numTerms;
    }
    this.writeVersion(ret, valueSet);
    return ret;
  }
}
