import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';
import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { CedarField } from '../../model/cedar/field/CedarField';
import { CedarWriters } from './CedarWriters';
import { CedarContainerChildInfo } from '../../model/cedar/types/beans/CedarContainerChildInfo';
import { JSONFieldWriter } from './JSONFieldWriter';

export abstract class JSONFieldWriterExternal extends JSONFieldWriter {
  protected constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  public override getAsJsonNode(field: CedarField): JsonNode {
    return super.getAsJsonNode(field, CedarContainerChildInfo.empty());
  }
}
