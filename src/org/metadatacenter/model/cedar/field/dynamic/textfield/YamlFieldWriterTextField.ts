import { JsonNode } from '../../../types/basic-types/JsonNode';
import { TextField } from './TextField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YamlTemplateFieldWriterInternal';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';

export class YamlFieldWriterTextField extends YamlTemplateFieldWriterInternal {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  override expandUINodeForYAML(field: TextField): JsonNode {
    const ret = JsonNode.getEmpty();
    if (field.valueRecommendationEnabled) {
      ret[YamlKeys.valueRecommendationEnabled] = field.valueRecommendationEnabled;
    }
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
