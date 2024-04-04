import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { StaticPageBreakField } from './StaticPageBreakField';
import { CedarModel } from '../../../constants/CedarModel';
import { JSONStaticFieldWriter } from '../JSONStaticFieldWriter';
import { CedarJSONWriters } from '../../../../../io/writer/json/CedarJSONWriters';

export class JSONFieldWriterStaticPageBreak extends JSONStaticFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarJSONWriters) {
    super(behavior, writers);
  }

  protected override expandUiNode(uiNode: JsonNode, _field: StaticPageBreakField): void {
    uiNode[CedarModel.content] = null;
  }
}
