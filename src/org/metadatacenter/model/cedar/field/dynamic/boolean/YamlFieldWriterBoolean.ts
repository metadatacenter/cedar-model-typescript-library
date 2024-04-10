import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YamlTemplateFieldWriterInternal';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';
import { XsdDatatype } from '../../../constants/XsdDatatype';
import { BooleanField } from './BooleanField';

export class YamlFieldWriterBoolean extends YamlTemplateFieldWriterInternal {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: BooleanField, _childInfo: ChildDeploymentInfo): void {
    vcNode[YamlKeys.datatype] = XsdDatatype.BOOLEAN;
    if (field.valueConstraints.nullEnabled !== null) {
      vcNode[YamlKeys.nullEnabled] = field.valueConstraints.nullEnabled;
    }
    if (field.valueConstraints.defaultValue !== undefined) {
      vcNode[YamlKeys.default] = field.valueConstraints.defaultValue;
    }
    if (field.valueConstraints.trueLabel != null) {
      vcNode[YamlKeys.trueLabel] = field.valueConstraints.trueLabel;
    }
    if (field.valueConstraints.falseLabel != null) {
      vcNode[YamlKeys.falseLabel] = field.valueConstraints.falseLabel;
    }
    if (field.valueConstraints.nullLabel != null) {
      vcNode[YamlKeys.nullLabel] = field.valueConstraints.nullLabel;
    }
  }
}
