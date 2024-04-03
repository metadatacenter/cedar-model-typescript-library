import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { StaticRichTextField } from './StaticRichTextField';
import { YAMLStaticFieldWriter } from '../YAMLStaticFieldWriter';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YAMLFieldWriterStaticRichText extends YAMLStaticFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  protected override expandUINodeForYAML(field: StaticRichTextField): JsonNode {
    return { [YamlKeys.content]: field.content };
  }
}
