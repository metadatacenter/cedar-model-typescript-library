import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { StaticPageBreakField } from './StaticPageBreakField';
import { JsonStaticFieldWriter } from '../JsonStaticFieldWriter';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';
import { CedarModel } from '../../../constants/CedarModel';

export class JsonFieldWriterStaticPageBreak extends JsonStaticFieldWriter {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  protected override expandUiNode(uiNode: JsonNode, field: StaticPageBreakField): void {
    if (field.content !== null) {
      uiNode[CedarModel.content] = field.content;
    }
  }
}
