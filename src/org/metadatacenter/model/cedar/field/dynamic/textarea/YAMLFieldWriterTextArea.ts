import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { YAMLTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YAMLTemplateFieldWriterInternal';
import { JsonNode } from '../../../types/basic-types/JsonNode';
import { TextField } from '../textfield/TextField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YAMLFieldWriterTextArea extends YAMLTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandUINodeForYAML(uiNode: JsonNode, _field: TextField, _childInfo: ChildDeploymentInfo): void {
    // TODO: elevate this constant
    uiNode[YamlKeys.datatype] = 'xsd:string';
  }
}