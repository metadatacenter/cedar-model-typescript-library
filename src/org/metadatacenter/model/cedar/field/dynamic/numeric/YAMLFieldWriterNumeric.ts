import { JsonNode } from '../../../types/basic-types/JsonNode';
import { NumericField } from './NumericField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YAMLTemplateFieldWriterInternal';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YAMLWriterBehavior } from '../../../../../behavior/YAMLWriterBehavior';
import { CedarYAMLWriters } from '../../../../../io/writer/yaml/CedarYAMLWriters';

export class YAMLFieldWriterNumeric extends YAMLTemplateFieldWriterInternal {
  constructor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: NumericField, _childInfo: ChildDeploymentInfo): void {
    vcNode[YamlKeys.datatype] = this.atomicWriter.write(field.valueConstraints.numberType);
    if (field.valueConstraints.minValue != null) {
      vcNode[YamlKeys.minValue] = field.valueConstraints.minValue;
    }
    if (field.valueConstraints.maxValue != null) {
      vcNode[YamlKeys.maxValue] = field.valueConstraints.maxValue;
    }
    if (field.valueConstraints.decimalPlace != null) {
      vcNode[YamlKeys.decimalPlace] = field.valueConstraints.decimalPlace;
    }
    if (field.valueConstraints.unitOfMeasure != null) {
      vcNode[YamlKeys.unit] = field.valueConstraints.unitOfMeasure;
    }
  }
}
