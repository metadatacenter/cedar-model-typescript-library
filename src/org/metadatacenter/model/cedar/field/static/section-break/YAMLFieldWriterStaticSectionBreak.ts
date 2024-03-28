import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { YAMLStaticFieldWriter } from '../YAMLStaticFieldWriter';

export class YAMLFieldWriterStaticSectionsBreak extends YAMLStaticFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }
}
