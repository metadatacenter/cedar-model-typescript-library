import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../../../io/writer/CedarWriters';
import { AbstractJSONControlledTermValueConstraintWriter } from '../AbstractJSONControlledTermValueConstraintWriter';
import { ControlledTermValueSet } from './ControlledTermValueSet';

export class JSONValueConstraintsValueSetWriter extends AbstractJSONControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(valueSet: ControlledTermValueSet): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    ret[CedarModel.ValueConstraints.vsCollection] = valueSet.vsCollection;
    ret[CedarModel.ValueConstraints.name] = valueSet.name;
    ret[CedarModel.ValueConstraints.uri] = this.atomicWriter.write(valueSet.uri);
    ret[CedarModel.ValueConstraints.numTerms] = valueSet.numTerms;
    return ret;
  }
}
