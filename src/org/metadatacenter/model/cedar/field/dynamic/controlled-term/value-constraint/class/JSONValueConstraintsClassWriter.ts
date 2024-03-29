import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../../../io/writer/CedarWriters';
import { AbstractJSONControlledTermValueConstraintWriter } from '../AbstractJSONControlledTermValueConstraintWriter';
import { ControlledTermClass } from './ControlledTermClass';

export class JSONValueConstraintsClassWriter extends AbstractJSONControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(clazz: ControlledTermClass): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    ret[CedarModel.ValueConstraints.label] = clazz.label;
    ret[CedarModel.ValueConstraints.source] = clazz.source;
    ret[CedarModel.ValueConstraints.type] = this.atomicWriter.write(clazz.type);
    ret[CedarModel.ValueConstraints.prefLabel] = clazz.prefLabel;
    ret[CedarModel.ValueConstraints.uri] = this.atomicWriter.write(clazz.uri);
    return ret;
  }
}
