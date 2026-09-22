import { YamlStaticFieldWriter } from '../YamlStaticFieldWriter';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';
import { YamlKeys } from '../../../constants/YamlKeys';
import { JsonNode } from '../../../types/basic-types/JsonNode';
import { StaticSectionBreakField } from './StaticSectionBreakField';

export class YAMLFieldWriterStaticSectionsBreak extends YamlStaticFieldWriter {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  protected override expandUINodeForYAML(field: StaticSectionBreakField): JsonNode {
    if (field.content !== null) {
      return { [YamlKeys.content]: field.content };
    } else {
      return JsonNode.getEmpty();
    }
  }
}
