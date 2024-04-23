import { JsonNode } from '../../../types/basic-types/JsonNode';
import { NumericField } from './NumericField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YamlTemplateFieldWriterInternal';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';

export class YamlFieldWriterNumeric extends YamlTemplateFieldWriterInternal {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
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
    if (field.valueConstraints.decimalPlaces != null) {
      vcNode[YamlKeys.decimalPlaces] = field.valueConstraints.decimalPlaces;
    }
    if (field.valueConstraints.unitOfMeasure != null) {
      vcNode[YamlKeys.unit] = field.valueConstraints.unitOfMeasure;
    }
  }
}
