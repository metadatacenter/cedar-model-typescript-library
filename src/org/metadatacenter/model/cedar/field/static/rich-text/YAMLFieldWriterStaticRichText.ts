import { JsonNode } from '../../../types/basic-types/JsonNode';
import { StaticRichTextField } from './StaticRichTextField';
import { YAMLStaticFieldWriter } from '../YAMLStaticFieldWriter';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YAMLWriterBehavior } from '../../../../../behavior/YAMLWriterBehavior';
import { CedarYAMLWriters } from '../../../../../io/writer/yaml/CedarYAMLWriters';

export class YAMLFieldWriterStaticRichText extends YAMLStaticFieldWriter {
  constructor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters) {
    super(behavior, writers);
  }

  protected override expandUINodeForYAML(field: StaticRichTextField): JsonNode {
    return { [YamlKeys.content]: field.content };
  }
}
