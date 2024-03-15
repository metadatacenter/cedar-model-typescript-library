import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { StaticPageBreakField } from './StaticPageBreakField';
import { CedarModel } from '../../../constants/CedarModel';
import { JSONStaticFieldWriter } from '../JSONStaticFieldWriter';

export class JSONFieldWriterStaticPageBreak extends JSONStaticFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  protected override expandUiNode(uiNode: JsonNode, _field: StaticPageBreakField): void {
    uiNode[CedarModel.content] = null;
  }
}
