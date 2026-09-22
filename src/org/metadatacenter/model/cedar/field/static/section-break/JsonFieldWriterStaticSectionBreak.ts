import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { JsonStaticFieldWriter } from '../JsonStaticFieldWriter';
import { StaticSectionBreakField } from './StaticSectionBreakField';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';
import { CedarModel } from '../../../constants/CedarModel';

export class JsonFieldWriterStaticSectionsBreak extends JsonStaticFieldWriter {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  protected override expandUiNode(uiNode: JsonNode, field: StaticSectionBreakField): void {
    if (field.content !== null) {
      uiNode[CedarModel.content] = field.content;
    }
  }
}
