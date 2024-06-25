import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { JsonWriterBehavior } from '../../../../../../../behavior/JsonWriterBehavior';
import { AbstractJsonControlledTermValueConstraintWriter } from '../AbstractJsonControlledTermValueConstraintWriter';
import { ControlledTermValueSet } from './ControlledTermValueSet';
import { CedarJsonWriters } from '../../../../../../../io/writer/json/CedarJsonWriters';

export class JsonValueConstraintsValueSetWriter extends AbstractJsonControlledTermValueConstraintWriter {
  public constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  public getAsJsonString(valueSet: ControlledTermValueSet, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(valueSet), null, indent);
  }

  override getAsJsonNode(valueSet: ControlledTermValueSet): JsonNode {
    const ret = JsonNode.getEmpty();
    ret[CedarModel.ValueConstraints.uri] = this.atomicWriter.write(valueSet.uri);
    ret[CedarModel.ValueConstraints.vsCollection] = valueSet.vsCollection;
    ret[CedarModel.ValueConstraints.name] = valueSet.name;
    if (valueSet.numTerms !== null) {
      ret[CedarModel.ValueConstraints.numTerms] = valueSet.numTerms;
    }
    return ret;
  }
}
