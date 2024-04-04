import { JsonNode } from '../../../types/basic-types/JsonNode';
import { YAMLStaticFieldWriter } from '../YAMLStaticFieldWriter';
import { StaticYoutubeField } from './StaticYoutubeField';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YAMLWriterBehavior } from '../../../../../behavior/YAMLWriterBehavior';
import { CedarYAMLWriters } from '../../../../../io/writer/yaml/CedarYAMLWriters';

export class YAMLFieldWriterStaticYoutube extends YAMLStaticFieldWriter {
  constructor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters) {
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
