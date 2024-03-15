import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { CedarModel } from '../../../constants/CedarModel';
import { JSONStaticFieldWriter } from '../JSONStaticFieldWriter';
import { StaticSectionBreakField } from './StaticSectionBreakField';

export class JSONFieldWriterStaticSectionsBreak extends JSONStaticFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  protected override expandUiNode(uiNode: JsonNode, _field: StaticSectionBreakField): void {
    uiNode[CedarModel.content] = null;
  }
}
