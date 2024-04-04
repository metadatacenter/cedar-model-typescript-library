import { YAMLTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YAMLTemplateFieldWriterInternal';
import { JsonNode } from '../../../types/basic-types/JsonNode';
import { TextField } from '../textfield/TextField';
import { YamlKeys } from '../../../constants/YamlKeys';
import { XsdDatatype } from '../../../constants/XsdDatatype';
import { YAMLWriterBehavior } from '../../../../../behavior/YAMLWriterBehavior';
import { CedarYAMLWriters } from '../../../../../io/writer/yaml/CedarYAMLWriters';

export class YAMLFieldWriterPhoneNumber extends YAMLTemplateFieldWriterInternal {
  constructor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters) {
    super(behavior, writers);
  }

  override expandUINodeForYAML(_field: TextField): JsonNode {
    return { [YamlKeys.datatype]: XsdDatatype.STRING };
  }
}
