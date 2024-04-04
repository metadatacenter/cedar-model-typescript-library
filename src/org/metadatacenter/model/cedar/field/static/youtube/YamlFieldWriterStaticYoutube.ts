import { JsonNode } from '../../../types/basic-types/JsonNode';
import { YamlStaticFieldWriter } from '../YamlStaticFieldWriter';
import { StaticYoutubeField } from './StaticYoutubeField';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';

export class YamlFieldWriterStaticYoutube extends YamlStaticFieldWriter {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
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
