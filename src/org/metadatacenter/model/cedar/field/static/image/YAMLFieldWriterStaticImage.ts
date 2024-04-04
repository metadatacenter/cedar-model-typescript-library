import { JsonNode } from '../../../types/basic-types/JsonNode';
import { StaticImageField } from './StaticImageField';
import { YAMLStaticFieldWriter } from '../YAMLStaticFieldWriter';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YAMLWriterBehavior } from '../../../../../behavior/YAMLWriterBehavior';
import { CedarYAMLWriters } from '../../../../../io/writer/yaml/CedarYAMLWriters';

export class YAMLFieldWriterStaticImage extends YAMLStaticFieldWriter {
  constructor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters) {
    super(behavior, writers);
  }

  protected override expandUINodeForYAML(field: StaticImageField): JsonNode {
    return { [YamlKeys.content]: field.content };
  }
}
