import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { StaticImageField } from './StaticImageField';
import { CedarModel } from '../../../constants/CedarModel';
import { JSONStaticFieldWriter } from '../JSONStaticFieldWriter';
import { CedarJSONWriters } from '../../../../../io/writer/json/CedarJSONWriters';

export class JSONFieldWriterStaticImage extends JSONStaticFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarJSONWriters) {
    super(behavior, writers);
  }

  protected override expandUiNode(uiNode: JsonNode, field: StaticImageField): void {
    uiNode[CedarModel.content] = field.content;
  }
}
