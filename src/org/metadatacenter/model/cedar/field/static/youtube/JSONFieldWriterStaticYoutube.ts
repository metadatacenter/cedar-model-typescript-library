import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { StaticYoutubeField } from './StaticYoutubeField';
import { CedarModel } from '../../../constants/CedarModel';
import { JSONStaticFieldWriter } from '../JSONStaticFieldWriter';
import { CedarJSONWriters } from '../../../../../io/writer/json/CedarJSONWriters';

export class JSONFieldWriterStaticYoutube extends JSONStaticFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarJSONWriters) {
    super(behavior, writers);
  }

  protected override expandUiNode(uiNode: JsonNode, field: StaticYoutubeField): void {
    uiNode[CedarModel.content] = field.videoId;
    uiNode[CedarModel.size] = {
      [CedarModel.width]: field.width,
      [CedarModel.height]: field.height,
    };
  }
}
