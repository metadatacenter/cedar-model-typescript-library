import { YamlStaticFieldWriter } from '../YamlStaticFieldWriter';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';
import { YamlKeys } from '../../../constants/YamlKeys';
import { JsonNode } from '../../../types/basic-types/JsonNode';
import { StaticPageBreakField } from './StaticPageBreakField';

export class YamlFieldWriterStaticPageBreak extends YamlStaticFieldWriter {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  protected override expandUINodeForYAML(field: StaticPageBreakField): JsonNode {
    if (field.content !== null) {
      return { [YamlKeys.content]: field.content };
    } else {
      return JsonNode.getEmpty();
    }
  }
}
