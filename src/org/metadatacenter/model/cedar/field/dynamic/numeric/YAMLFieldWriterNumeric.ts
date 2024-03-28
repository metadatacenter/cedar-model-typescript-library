import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { CedarModel } from '../../../constants/CedarModel';
import { NumericField } from './NumericField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YAMLTemplateFieldWriterInternal';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YAMLFieldWriterNumeric extends YAMLTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: NumericField, childInfo: ChildDeploymentInfo): void {
    super.expandValueConstraintsNodeForYAML(vcNode, field, childInfo);
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
