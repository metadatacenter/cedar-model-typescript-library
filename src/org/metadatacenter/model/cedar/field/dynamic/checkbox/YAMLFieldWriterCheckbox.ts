import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CheckboxField } from './CheckboxField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YAMLTemplateFieldWriterInternal';
import { TextField } from '../textfield/TextField';
import { YamlKeys } from '../../../constants/YamlKeys';
import { XsdDatatype } from '../../../constants/XsdDatatype';
import { YAMLWriterBehavior } from '../../../../../behavior/YAMLWriterBehavior';
import { CedarYAMLWriters } from '../../../../../io/writer/yaml/CedarYAMLWriters';

export class YAMLFieldWriterCheckbox extends YAMLTemplateFieldWriterInternal {
  constructor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters) {
    super(behavior, writers);
  }

  override expandUINodeForYAML(_field: TextField): JsonNode {
    return { [YamlKeys.datatype]: XsdDatatype.STRING };
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: CheckboxField, _childInfo: ChildDeploymentInfo): void {
    this.expandLiterals(field, vcNode);
  }
}
