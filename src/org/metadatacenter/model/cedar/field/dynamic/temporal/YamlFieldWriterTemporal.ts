import { JsonNode } from '../../../types/basic-types/JsonNode';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { TemporalField } from './TemporalField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YamlTemplateFieldWriterInternal';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';
import { TemporalDefaultValueValidator } from './TemporalDefaultValueValidator';

export class YamlFieldWriterTemporal extends YamlTemplateFieldWriterInternal {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: TemporalField, _childInfo: ChildDeploymentInfo): void {
    // A temporal field has a granularity, at any depth and in either form. Java cannot build one
    // without it, and both readers refuse a document that states none.
    if (field.temporalGranularity === TemporalGranularity.NULL) {
      throw new Error('A temporal field must have a granularity.');
    }
    TemporalDefaultValueValidator.assertValid(
      field.valueConstraints.temporalType,
      field.temporalGranularity,
      field.valueConstraints.defaultValue,
    );
    vcNode[YamlKeys.datatype] = this.atomicWriter.write(field.valueConstraints.temporalType);
    vcNode[YamlKeys.granularity] = this.atomicWriter.write(field.temporalGranularity);
    if (field.valueConstraints.defaultValue != null && field.valueConstraints.defaultValue !== '') {
      vcNode[YamlKeys.default] = field.valueConstraints.defaultValue;
    }
    if (
      field.temporalGranularity !== TemporalGranularity.YEAR &&
      field.temporalGranularity !== TemporalGranularity.MONTH &&
      field.temporalGranularity !== TemporalGranularity.DAY
    ) {
      if (field.inputTimeFormat !== TimeFormat.NULL) {
        vcNode[YamlKeys.inputTimeFormat] = this.atomicWriter.write(field.inputTimeFormat);
      }
      // Written as the field states it, false included, and left out when the field states nothing,
      // as the JSON leaves it out.
      if (field.timezoneEnabled !== null) {
        vcNode[YamlKeys.inputTimeZone] = field.timezoneEnabled;
      }
    }
  }
}
