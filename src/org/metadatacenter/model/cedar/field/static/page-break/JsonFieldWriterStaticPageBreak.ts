import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { StaticPageBreakField } from './StaticPageBreakField';
import { JsonStaticFieldWriter } from '../JsonStaticFieldWriter';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';

export class JsonFieldWriterStaticPageBreak extends JsonStaticFieldWriter {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  protected override expandUiNode(_uiNode: JsonNode, _field: StaticPageBreakField): void {}
}
