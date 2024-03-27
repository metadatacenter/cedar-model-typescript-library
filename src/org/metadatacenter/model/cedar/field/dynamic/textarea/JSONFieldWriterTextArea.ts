import { JSONTemplateFieldWriterInternal } from '../../../../../io/writer/json/JSONTemplateFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';

export class JSONFieldWriterTextArea extends JSONTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }
}
