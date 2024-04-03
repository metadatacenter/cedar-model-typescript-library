import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { YAMLStaticFieldWriter } from '../YAMLStaticFieldWriter';
import { StaticYoutubeField } from './StaticYoutubeField';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YAMLFieldWriterStaticYoutube extends YAMLStaticFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  protected override expandUINodeForYAML(field: StaticYoutubeField): JsonNode {
    return {
      [YamlKeys.content]: field.videoId,
      [YamlKeys.width]: field.width,
      [YamlKeys.height]: field.height,
    };
  }
}
