import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarModel } from '../../../constants/CedarModel';
import { JSONStaticFieldWriter } from '../JSONStaticFieldWriter';
import { StaticSectionBreakField } from './StaticSectionBreakField';
import { CedarJSONWriters } from '../../../../../io/writer/json/CedarJSONWriters';

export class JSONFieldWriterStaticSectionsBreak extends JSONStaticFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarJSONWriters) {
    super(behavior, writers);
  }

  protected override expandUiNode(uiNode: JsonNode, _field: StaticSectionBreakField): void {
    uiNode[CedarModel.content] = null;
  }
}
