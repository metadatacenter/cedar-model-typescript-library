import { JsonNode } from '../../../types/basic-types/JsonNode';
import { StaticImageField } from './StaticImageField';
import { YamlStaticFieldWriter } from '../YamlStaticFieldWriter';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';

export class YamlFieldWriterStaticImage extends YamlStaticFieldWriter {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  protected override expandUINodeForYAML(field: StaticImageField): JsonNode {
    if (field.content !== null) {
      return { [YamlKeys.content]: field.content };
    } else {
      return JsonNode.getEmpty();
    }
  }
}
