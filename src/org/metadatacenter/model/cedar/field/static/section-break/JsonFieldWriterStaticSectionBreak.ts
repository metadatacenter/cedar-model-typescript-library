import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { JsonStaticFieldWriter } from '../JsonStaticFieldWriter';
import { StaticSectionBreakField } from './StaticSectionBreakField';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';

export class JsonFieldWriterStaticSectionsBreak extends JsonStaticFieldWriter {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  protected override expandUiNode(_uiNode: JsonNode, _field: StaticSectionBreakField): void {}
}
