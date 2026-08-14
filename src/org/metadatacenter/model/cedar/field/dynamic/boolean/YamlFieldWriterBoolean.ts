import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YamlTemplateFieldWriterInternal';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';
import { BooleanField } from './BooleanField';

export class YamlFieldWriterBoolean extends YamlTemplateFieldWriterInternal {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: BooleanField, _childInfo: ChildDeploymentInfo): void {
    // The boolean field's datatype is implied by the field type, and no other library writes it.
    if (field.valueConstraints.defaultValue !== undefined) {
      vcNode[YamlKeys.default] = field.valueConstraints.defaultValue;
    }
    if (field.valueConstraints.nullEnabled !== null) {
      vcNode[YamlKeys.nullEnabled] = field.valueConstraints.nullEnabled;
    }
    const labels: JsonNode = JsonNode.getEmpty();
    if (field.valueConstraints.trueLabel != null) {
      labels[YamlKeys.trueLabel] = field.valueConstraints.trueLabel;
    }
    if (field.valueConstraints.falseLabel != null) {
      labels[YamlKeys.falseLabel] = field.valueConstraints.falseLabel;
    }
    if (field.valueConstraints.nullLabel != null) {
      labels[YamlKeys.nullLabel] = field.valueConstraints.nullLabel;
    }
    if (JsonNode.hasEntries(labels)) {
      vcNode[YamlKeys.labels] = labels;
    }
  }
}
