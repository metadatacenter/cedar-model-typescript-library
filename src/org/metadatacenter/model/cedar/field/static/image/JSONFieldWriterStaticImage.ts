import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { StaticImageField } from './StaticImageField';
import { CedarModel } from '../../../constants/CedarModel';
import { JSONStaticFieldWriter } from '../JSONStaticFieldWriter';

export class JSONFieldWriterStaticImage extends JSONStaticFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  protected override expandUiNode(uiNode: JsonNode, field: StaticImageField): void {
    uiNode[CedarModel.content] = field.content;
  }
}
