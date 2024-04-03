import { JsonNode } from '../../../types/basic-types/JsonNode';
import { TextField } from './TextField';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YAMLTemplateFieldWriterInternal';
import { YamlKeys } from '../../../constants/YamlKeys';
import { XsdDatatype } from '../../../constants/XsdDatatype';

export class YAMLFieldWriterTextField extends YAMLTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandUINodeForYAML(uiNode: JsonNode, field: TextField, childInfo: ChildDeploymentInfo): void {
    super.expandUINodeForYAML(uiNode, field, childInfo);
    if (field.valueRecommendationEnabled) {
      uiNode[YamlKeys.valueRecommendationEnabled] = field.valueRecommendationEnabled;
    }
    uiNode[YamlKeys.datatype] = XsdDatatype.STRING;
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
