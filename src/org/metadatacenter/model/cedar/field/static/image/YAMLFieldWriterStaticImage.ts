import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { StaticImageField } from './StaticImageField';
import { YAMLStaticFieldWriter } from '../YAMLStaticFieldWriter';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YAMLFieldWriterStaticImage extends YAMLStaticFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  protected override expandUINodeForYAML(uiNode: JsonNode, field: StaticImageField): void {
    uiNode[YamlKeys.content] = field.content;
  }
}
