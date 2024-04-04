import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { AbstractJSONControlledTermValueConstraintWriter } from '../AbstractJSONControlledTermValueConstraintWriter';
import { ControlledTermValueSet } from './ControlledTermValueSet';
import { CedarJSONWriters } from '../../../../../../../io/writer/json/CedarJSONWriters';

export class JSONValueConstraintsValueSetWriter extends AbstractJSONControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarJSONWriters) {
    super(behavior, writers);
  }

  public getAsJsonString(valueSet: ControlledTermValueSet, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(valueSet), null, indent);
  }

  override getAsJsonNode(valueSet: ControlledTermValueSet): JsonNode {
    const ret = JsonNode.getEmpty();
    ret[CedarModel.ValueConstraints.vsCollection] = valueSet.vsCollection;
    ret[CedarModel.ValueConstraints.name] = valueSet.name;
    ret[CedarModel.ValueConstraints.uri] = this.atomicWriter.write(valueSet.uri);
    ret[CedarModel.ValueConstraints.numTerms] = valueSet.numTerms;
    return ret;
  }
}
