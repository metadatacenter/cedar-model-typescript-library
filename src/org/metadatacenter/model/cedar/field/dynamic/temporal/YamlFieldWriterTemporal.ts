import { JsonNode } from '../../../types/basic-types/JsonNode';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { TemporalField } from './TemporalField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YamlTemplateFieldWriterInternal';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';

export class YamlFieldWriterTemporal extends YamlTemplateFieldWriterInternal {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: TemporalField, _childInfo: ChildDeploymentInfo): void {
    vcNode[YamlKeys.datatype] = this.atomicWriter.write(field.valueConstraints.temporalType);
    if (field.temporalGranularity !== TemporalGranularity.NULL) {
      vcNode[YamlKeys.granularity] = this.atomicWriter.write(field.temporalGranularity);
      if (
        field.temporalGranularity !== TemporalGranularity.YEAR &&
        field.temporalGranularity !== TemporalGranularity.MONTH &&
        field.temporalGranularity !== TemporalGranularity.DAY
      ) {
        if (field.inputTimeFormat !== TimeFormat.NULL) {
          vcNode[YamlKeys.inputTimeFormat] = this.atomicWriter.write(field.inputTimeFormat);
        }
        if (field.timezoneEnabled) {
          vcNode[YamlKeys.inputTimeZone] = field.timezoneEnabled;
        }
      }
    }
  }
}
