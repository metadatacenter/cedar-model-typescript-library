import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { AbstractJSONControlledTermValueConstraintWriter } from '../AbstractJSONControlledTermValueConstraintWriter';
import { ControlledTermClass } from './ControlledTermClass';
import { CedarJSONWriters } from '../../../../../../../io/writer/json/CedarJSONWriters';

export class JSONValueConstraintsClassWriter extends AbstractJSONControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarJSONWriters) {
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
