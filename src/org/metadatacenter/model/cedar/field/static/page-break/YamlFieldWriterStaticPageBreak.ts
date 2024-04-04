import { YamlStaticFieldWriter } from '../YamlStaticFieldWriter';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';

export class YamlFieldWriterStaticPageBreak extends YamlStaticFieldWriter {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }
}
