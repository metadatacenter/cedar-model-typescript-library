import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { StaticYoutubeField } from './StaticYoutubeField';
import { CedarModel } from '../../../constants/CedarModel';
import { JsonStaticFieldWriter } from '../JsonStaticFieldWriter';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';

export class JsonFieldWriterStaticYoutube extends JsonStaticFieldWriter {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  protected override expandUiNode(uiNode: JsonNode, field: StaticYoutubeField): void {
    if (field.videoId !== null) {
      uiNode[CedarModel.content] = field.videoId;
    }
    uiNode[CedarModel.size] = {
      [CedarModel.width]: field.width,
      [CedarModel.height]: field.height,
    };
  }
}
