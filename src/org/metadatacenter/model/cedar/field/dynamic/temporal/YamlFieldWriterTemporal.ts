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

  override expandUINodeForYAML(field: TemporalField): JsonNode {
    const ret = JsonNode.getEmpty();
    if (field.timezoneEnabled) {
      ret[YamlKeys.timeZone] = field.timezoneEnabled;
    }
    if (field.inputTimeFormat !== TimeFormat.NULL) {
      ret[YamlKeys.timeFormat] = this.atomicWriter.write(field.inputTimeFormat);
    }
    if (field.temporalGranularity !== TemporalGranularity.NULL) {
      ret[YamlKeys.granularity] = this.atomicWriter.write(field.temporalGranularity);
    }
    return ret;
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: TemporalField, _childInfo: ChildDeploymentInfo): void {
    vcNode[YamlKeys.datatype] = this.atomicWriter.write(field.valueConstraints.temporalType);
  }
}
