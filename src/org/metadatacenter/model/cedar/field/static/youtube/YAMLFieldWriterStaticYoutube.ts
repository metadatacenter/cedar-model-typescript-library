import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { CedarModel } from '../../../constants/CedarModel';
import { YAMLStaticFieldWriter } from '../YAMLStaticFieldWriter';
import { StaticYoutubeField } from './StaticYoutubeField';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YAMLFieldWriterStaticYoutube extends YAMLStaticFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  protected override expandUINodeForYAML(uiNode: JsonNode, field: StaticYoutubeField): void {
    uiNode[YamlKeys.content] = field.videoId;
    uiNode[YamlKeys.width] = field.width;
    uiNode[YamlKeys.height] = field.height;
  }
}
