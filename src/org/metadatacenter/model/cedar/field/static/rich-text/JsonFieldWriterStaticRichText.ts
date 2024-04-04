import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { StaticRichTextField } from './StaticRichTextField';
import { CedarModel } from '../../../constants/CedarModel';
import { JsonStaticFieldWriter } from '../JsonStaticFieldWriter';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';

export class JsonFieldWriterStaticRichText extends JsonStaticFieldWriter {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  protected override expandUiNode(uiNode: JsonNode, field: StaticRichTextField): void {
    uiNode[CedarModel.content] = field.content;
  }
}
