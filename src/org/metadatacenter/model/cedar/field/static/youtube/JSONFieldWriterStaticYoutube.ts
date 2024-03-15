import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { StaticYoutubeField } from './StaticYoutubeField';
import { CedarModel } from '../../../constants/CedarModel';
import { JSONStaticFieldWriter } from '../JSONStaticFieldWriter';

export class JSONFieldWriterStaticYoutube extends JSONStaticFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  protected override expandUiNode(uiNode: JsonNode, field: StaticYoutubeField): void {
    uiNode[CedarModel.content] = field.videoId;
    uiNode[CedarModel.content] = field.videoId;
    uiNode[CedarModel.size] = {
      [CedarModel.width]: field.width,
      [CedarModel.height]: field.height,
    };
  }
}
