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
    if (field.width !== null || field.height !== null) {
      const sizeNode = JsonNode.getEmpty();
      if (field.width !== null) {
        sizeNode[CedarModel.width] = field.width;
      }
      if (field.height !== null) {
        sizeNode[CedarModel.height] = field.height;
      }
      uiNode[CedarModel.size] = sizeNode;
    }
  }
}
