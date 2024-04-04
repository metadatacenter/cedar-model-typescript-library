import { JsonNode } from '../../../types/basic-types/JsonNode';
import { TextField } from './TextField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YAMLTemplateFieldWriterInternal';
import { YamlKeys } from '../../../constants/YamlKeys';
import { XsdDatatype } from '../../../constants/XsdDatatype';
import { YAMLWriterBehavior } from '../../../../../behavior/YAMLWriterBehavior';
import { CedarYAMLWriters } from '../../../../../io/writer/yaml/CedarYAMLWriters';

export class YAMLFieldWriterTextField extends YAMLTemplateFieldWriterInternal {
  constructor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters) {
    super(behavior, writers);
  }

  override expandUINodeForYAML(field: TextField): JsonNode {
    const ret = JsonNode.getEmpty();
    if (field.valueRecommendationEnabled) {
      ret[YamlKeys.valueRecommendationEnabled] = field.valueRecommendationEnabled;
    }
    ret[YamlKeys.datatype] = XsdDatatype.STRING;
    return ret;
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: TextField, _childInfo: ChildDeploymentInfo): void {
    if (field.valueConstraints.defaultValue != null && field.valueConstraints.defaultValue !== '') {
      vcNode[YamlKeys.default] = field.valueConstraints.defaultValue;
    }
    if (field.valueConstraints.minLength != null) {
      vcNode[YamlKeys.minLength] = field.valueConstraints.minLength;
    }
    if (field.valueConstraints.maxLength != null) {
      vcNode[YamlKeys.maxLength] = field.valueConstraints.maxLength;
    }
    if (field.valueConstraints.regex != null) {
      vcNode[YamlKeys.regex] = field.valueConstraints.regex;
    }
  }
}
