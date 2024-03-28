import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { YAMLTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YAMLTemplateFieldWriterInternal';

export class YAMLFieldWriterAttributeValue extends YAMLTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }
}
