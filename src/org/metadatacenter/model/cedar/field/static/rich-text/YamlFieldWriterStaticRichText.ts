import { JsonNode } from '../../../types/basic-types/JsonNode';
import { StaticRichTextField } from './StaticRichTextField';
import { YamlStaticFieldWriter } from '../YamlStaticFieldWriter';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';

export class YamlFieldWriterStaticRichText extends YamlStaticFieldWriter {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  protected override expandUINodeForYAML(field: StaticRichTextField): JsonNode {
    return { [YamlKeys.content]: field.content };
  }
}
