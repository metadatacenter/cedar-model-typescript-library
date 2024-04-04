import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { JsonWriterBehavior } from '../../../../../../../behavior/JsonWriterBehavior';
import { AbstractJsonControlledTermValueConstraintWriter } from '../AbstractJsonControlledTermValueConstraintWriter';
import { ControlledTermClass } from './ControlledTermClass';
import { CedarJsonWriters } from '../../../../../../../io/writer/json/CedarJsonWriters';

export class JsonValueConstraintsClassWriter extends AbstractJsonControlledTermValueConstraintWriter {
  public constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  public getAsJsonString(clazz: ControlledTermClass, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(clazz), null, indent);
  }

  override getAsJsonNode(clazz: ControlledTermClass): JsonNode {
    const ret = JsonNode.getEmpty();
    ret[CedarModel.ValueConstraints.label] = clazz.label;
    ret[CedarModel.ValueConstraints.source] = clazz.source;
    ret[CedarModel.ValueConstraints.type] = this.atomicWriter.write(clazz.type);
    ret[CedarModel.ValueConstraints.prefLabel] = clazz.prefLabel;
    ret[CedarModel.ValueConstraints.uri] = this.atomicWriter.write(clazz.uri);
    return ret;
  }
}
