import { JSONTemplateFieldWriterInternal } from '../../../../../io/writer/JSONTemplateFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';

export class JSONFieldWriterPhoneNumber extends JSONTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }
}
